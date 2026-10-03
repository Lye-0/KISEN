import { stagedHint } from './hintStages';
import { owns, selectedDeskTool, signalReady, liveCircuit, trace, validTicket } from './model';
import type { State, Room, Item } from './model';
import type { Focus } from './World';
import { boardingGeometry, illuminatedPorts, stopAt } from './stopping';
import { receiptInitial, receiptTrayReleases } from './lostProperty';
import { balanceReleases } from './balance';
import { shedUnlocks } from './posters';
import { cargoUnlocks } from './cargoDockets';
import { cargoInitial, stairsClear } from './cargo';
import type { Cargo } from './cargo';

export interface ProgressHint {
    id: string;
    title: string;
    clues: readonly [string, string, ...string[]];
}
interface Candidate extends ProgressHint { rooms: Room[]; focuses: Focus[] }
const hint = (id: string, title: string, first: string, detail: string): ProgressHint => ({ id, title, clues: [first, detail] });
const on = (s: State, key: string) => s.values[key]?.[0] === 1;
const visited = (s: State, rooms: Room[]) => rooms.includes(s.room) || s.visited.some(v => rooms.some(r => v.startsWith(r + ':')));
const obtained = (s: State, item: Item, origin: string) => Boolean(s.locations[item] && s.locations[item] !== origin);

function envelopeHint(s: State): ProgressHint {
    if (!owns(s, 'receipt')) return hint("arrival-receipt", "鞄の持ち手にある受取票", "車内の鞄を調べ、持ち手に挟まっている受取票を取ってください。", "持ち物の受取票を押して開いてください。車内のどの座席を調べればよいかが書かれています。");
    if (s.seats[2] === 1) return hint("arrival-envelope-take", "座席の裏にある封筒", "動かした座席の裏側に、封筒が残っています。", "座席を動かす取っ手ではなく、ポケットから見えている封筒を押すと取れます。");
    return hint("arrival-seat", "受取票が示す座席", "受取票に書かれた扉を見つけ、そこから座席を数えてください。", "車内には一枚扉と二枚扉があります。受取票に書かれた側から数えた座席の背を動かし、裏側を調べてください。");
}
function arrivalHint(s: State): ProgressHint {
    if (owns(s, 'officeKey')) return hint("office-unlock", "駅務室の鍵を使う", "待合室にある駅務室の扉を調べてください。", "持ち物の鍵を選んで鍵穴を押してください。鍵が開いた後は、扉の取っ手を動かすと入れます。");
    if (on(s, 'caseOpen')) return hint("arrival-key-take", "書類箱から鍵を取る", "開いた書類箱の中に、駅務室の鍵があります。", "鍵を取ったら待合室へ向かい、窓口の隣にある駅務室の扉で使ってください。");
    if (!owns(s, 'receipt')) return envelopeHint(s);
    if (!owns(s, 'photos')) {
        if (s.bag.mouth) return hint("arrival-photos-take", "鞄から写真を取る", "開いた鞄の中にある写真を取ってください。", "持ち物の写真を押すと、4枚の一覧が開きます。それぞれの表と裏を調べてください。");
        if (!s.bag.clasp) return hint("arrival-clasp", "鞄の留め金を外す", "鞄の口を留めている、真鍮の金具を動かしてください。", "留め金を外しても開かない場合は、口の上に掛かっている肩ひもを脇へ動かしてください。");
        if (s.bag.strap < .8) return hint("arrival-strap", "鞄の肩ひもを動かす", "留め金は外れていますが、肩ひもが鞄の口に掛かっています。", "肩ひもを脇へ動かしてから、鞄の口を押して開いてください。");
        return hint("arrival-bag-open", "鞄を開く", "留め金と肩ひもが外れ、鞄を開けられる状態です。", "鞄の口を押して開き、中の写真を取ってください。");
    }
    if (!owns(s, 'envelope')) return envelopeHint(s);
    if (!owns(s, 'ownTicket')) return hint("arrival-ticket", "床の到着券を拾う", "車内の扉の近くに落ちている切符を拾ってください。", "この到着券の穴は、写真裏の部分写しや、駅務室の乗車券控を考える手がかりになります。");
    return hint("arrival-case", "写真の順番と撮影した側", "まず写真裏の切符の穴から撮影順を決め、その順に写真を並べてください。", "同じ列の穴を比べてください。一度開いた穴は消えないので、空欄の写真が先、穴のある写真が後です。次に写真の表と封筒の見取図を比べ、各写真をどの側から撮ったか調べます。その方角を、写真の順に書類箱へ入力してください。");
}
function cargoHint(s: State): ProgressHint {
    if (on(s, 'cargoOpen')) {
        const names = [s.locations.spareLamp === 'cargoChest' ? '交換灯具' : '', s.locations.cargoDocket === 'cargoChest' ? '経路控' : ''].filter(Boolean).join('と');
        return hint("cargo-take", "木箱の中身を取る", "開いた木箱の中にある" + names + "を取ってください。", "荷物室の幅広い木箱を開き、中に見える物をそれぞれ押して取ってください。");
    }
    if (cargoUnlocks(s.values.cargoDigits ?? [])) return hint("cargo-release", "木箱の留めを引く", "数字は合っています。木箱の蓋の留めを引いてください。", "数字の輪を回すだけでは開きません。輪の近くにある留めを動かしてください。");
    if (!owns(s, 'counterRecords')) {
        if (s.window.open) return hint("counter-records", "窓口の帳票を取る", "開いた窓口の中から、帳票を取ってください。", "持ち物の帳票を押して開いてください。壁にある古い時刻表と合わせて、今使える便を調べられます。");
        if (s.window.latch) return hint("counter-open", "窓口の小戸を開く", "掛け金は外れています。小戸そのものを持ち上げてください。", "戸の指掛けを操作すると開きます。中にある帳票を取ってください。");
        if (s.window.supported) return hint("counter-latch", "小戸の掛け金を外す", "小戸が持ち上がっている間に、横の掛け金を外してください。", "戸を少し持ち上げると、掛け金に掛かる重みがなくなります。掛け金を外した後、戸をさらに開けてください。");
        return hint("counter-lift", "窓口の小戸を持ち上げる", "待合室の窓口を調べ、小戸の指掛けを動かしてください。", "まず戸を少し持ち上げてから、横の掛け金を外してください。掛け金が外れたら戸を開けられます。");
    }
    if (s.locations.knob !== 'recorder') {
        if (owns(s, 'knob')) return hint("recorder-fit", "録音機につまみを取り付ける", "黒いつまみは、駅務室の録音機に取り付けられます。", "録音機を開き、持ち物の黒いつまみを選んで、右側のリールの中心を押してください。");
        if (on(s, 'drawerOpen')) return hint("drawer-take", "引出しのつまみを取る", "開いた受付の引出しから、黒いつまみを取ってください。", "駅務室の録音機は、右側のリールの中心に部品が足りません。取ったつまみをそこで使ってください。");
        return hint("drawer-code", "受付の引出しに入れる時刻", "帳票の改正日・受付日・運休の掲示を読んで、当日使える最後の便を探してください。", "古い時刻表ではなく、受付日に有効な時刻表を使います。運休の便を除いた最後の受付時刻を、時・分の4桁にして引出しへ入力してください。入力後は引出しを引いてください。");
    }
    return hint("cargo-code", "録音から荷札の順番を決める", "録音AとBの記録紙を開き、同じ出来事が同じ位置に来るように重ねてください。", "記録紙Bは横に動かせます。2枚をそろえると、出来事が起きた順番が分かります。外の貨物留置の掲示から使う荷札を絞り、その荷番号を出来事の順に並べてください。");
}
function shedHint(s: State): ProgressHint {
    return shedUnlocks(s.values.shedDigits ?? [])
        ? hint("shed-release", "灯具小屋の留めを引く", "小屋の錠の数字は合っています。右側の留めを動かしてください。", "駅前の側道にある灯具小屋で、数字の輪とは別に留めを引くと扉を開けられます。")
        : hint("shed-code", "破れた紙をつなぐ", "駅前の掲示板にある4枚の紙から、つながる2枚を探してください。", "紙を左右に置き、写真の景色と縁の穴がつながる組を探します。つなぎ目の数字を上から読み、小屋の錠へ入力してください。");
}
function gateHint(s: State): ProgressHint {
    if (on(s, 'gateOpen')) return hint("north-enter", "保守柵の先へ進む", "保守柵は開いています。柵の先から北ホームへ進んでください。", "「戻る」で跨線橋の景色に戻り、開いた柵の向こうを押すと渡れます。");
    if (s.locations.support !== 'bridgeGate') return hint("gate-restore-support", "保守柵に支えを戻す", "柵を開き直すには、取り外した支えを元に戻す必要があります。", "支えを別の場所で使っている場合は、上に付けた灯具を先に外してから回収してください。支えを持って保守柵へ戻り、元の取付部へ付けてください。");
    if (!owns(s, 'hook') && !owns(s, 'pin')) return on(s, 'rackRing')
        ? hint("hook-take", "鉤付き棒を取る", "固定用の輪が動き、棒を取り出せる状態です。", "駅務室の傘立てにある鉤付き棒を押して、持ち上げてください。")
        : hint("hook-ring", "棒を固定している輪を動かす", "鉤付き棒の曲がった先が、固定用の輪に引っ掛かっています。", "駅務室の傘立てを調べ、棒を留めている輪を傾けてください。その後で棒を持ち上げると取れます。");
    if (!owns(s, 'pin')) {
        if (on(s, 'tagCaught')) return hint("rail-withdraw", "金具を引き寄せる", "鉤に金具が掛かっています。棒を手前へ引いてください。", "棒の手元側を操作すると、金具を一緒に引き寄せられます。先端を下へ向けると金具が外れてしまいます。");
        if (s.values.tagDepth?.[0] === 2) return hint("rail-turn", "鉤を金具に掛ける", "棒の先が金具まで届いています。鉤を上へ向けてください。", "手すりの外側にある棒の先端を押し、吊られた金具に鉤を掛けてください。");
        if (s.values.tagDepth?.[0] === 1) return hint("rail-extend", "棒をもう少し奥へ送る", "棒は隙間に入りましたが、先端が金具まで届いていません。", "差し込んだ棒を奥へ送ってください。金具まで届いたら、鉤の向きを変えられます。");
        return hint("rail-insert", "棒で外側の金具を取る", "跨線橋の手すりの外側にある金具は、手では届きません。", "持ち物の鉤付き棒を選び、「手すりの下の隙間」を押して差し込んでください。");
    }
    if (on(s, 'gateRod')) return hint("gate-push", "保守柵を開く", "横棒が外れています。柵を押して開いてください。", "留めを元に戻す前に柵を動かしてください。開くと北ホームへ渡れます。");
    if (on(s, 'gateSupport')) return hint("gate-slot", "留めの溝に金具を差す", "支えを起こしたので、留めの奥にある細い溝を調べられます。", "手すりから取った薄い金具を選び、留めの溝に差してください。その後、横棒を受けから外してください。");
    return hint("gate-brace", "保守柵の支えを起こす", "横棒を動かす前に、折り畳まれた支えを起こしてください。", "支えを起こすと、留めの奥の溝に金具を差せるようになります。横棒を引くだけでは、ばねで元に戻ります。");
}
function ticketHint(s: State): ProgressHint {
    if (s.mounted) return hint("ticket-recheck-mounted", "差し込んだ切符を見直す", "切符の穴や便印が、現在の線路のつなぎ方に合っていません。", "切符受けの押さえを開き、券を取り出してください。駅務室の机で見直し、余分な穴や間違った便印があれば新しい用紙で作り直してください。");
    if (!s.draft || !owns(s, 'ticket')) return hint("ticket-paper", "切符の用紙を取る", "駅務室の机の右側にある紙束から、用紙を取ってください。", "机の上部にある「切符を作る」を押すと、取った用紙に穴を開けたり便印を押したりできます。");
    if (selectedDeskTool(s) === null) return hint("ticket-tool", "3本のハサミを試す", "「鋏を選ぶ・試す」で、同じ刃を使って3本のハサミを比べてください。", "ハサミと刃を選び、試し紙の切る位置を押します。乗車券控や券の断片と同じ形の穴を開けられるハサミを選んでください。その選択は「切符を作る」でも使います。");
    if (!s.draft.holes.length) return hint("ticket-derive", "線路の順番を切符に写す", "帰り道で通る地点を順番に並べ、各地点で必要な穴を調べてください。", "乗車券控の撮影手帖と連写から、1から2へ進む間に通過した標柱を探し、同じ列の穴の縁と比べます。帰路の標柱は、北ホームの各レバーの操作札でも調べられます。");
    return hint("ticket-check", "作った切符を確認する", "各列の穴の形と位置、便印を見直してください。", "通る地点の順番、穴を開ける縁、ハサミによる穴の違いを確認します。便印は運行控で調べてください。間違った穴や便印は消せないので、新しい用紙で作り直せます。");
}


function readerHint(s: State): ProgressHint {
    return s.draft?.back ? hint("reader-face", "切符を表に戻す", "差し込む前に、切符を表に戻してください。", "切符受けの押さえを開き、表を向けた券を差し込んでください。")
        : hint("reader-insert", "切符受けに券を入れる", "切符受けの押さえを開いてから、券を差し込んでください。", "持ち物の切符を選び、受けへ差し込んでください。差し込み終わったら、押さえを閉じて固定してください。");
}
function lampObservationHint(s: State): ProgressHint {
    if (s.locations.lamp === 'lightStand' || s.locations.spareLamp === 'lightStand') return hint("lamp-observe", "灯具の光を動かす", "左右・上下の調整つまみを動かし、光が当たる場所を変えてください。", "窓の外の標柱や線路を照らして観察します。高さを変えたい場合は、一度灯具を外して受け口に支えを取り付けてください。見えた状態は「記録する」で残せます。");
    if (!owns(s, 'lamp') && !owns(s, 'spareLamp')) return hint("lamp-return-tool", "使った灯具を回収する", "別の場所に取り付けた灯具は、外して持ち運べます。", "北ホームや側道の観測窓に置いた灯具を調べてください。まだ取っていない灯具は、小屋の壁の金具や荷物室の木箱にあります。");
    if (s.locations.support === 'inventory') return hint("lamp-brace", "灯具の取付位置を高くする", "持ち物の支えを、窓辺の空いている受け口に取り付けてください。", "支えを付けてから灯具を取り付けると、光を出す位置が高くなります。窓の外を見て、光が遮られる場所の違いを確かめてください。");
    return hint("lamp-fit", "窓辺に灯具を取り付ける", "持ち物の灯具を選び、窓の下にある受け口を押してください。", "取り付けた後は、窓の外を見ながら光の向きを変えられます。高い位置に取り付けたい場合は、開いた保守柵から支えを回収してください。");
}

/** Derives advice from live game facts. Looking at a hint never mutates progress. */
function baseProgressHint(s: State, focus: Focus = null): ProgressHint {
    if (focus === 'pointDetail' || focus === 'pointSlip') focus = 'points';
    if (s.ended || s.room === 'return' && s.values.returnTrip?.[1] === 1)
        return hint("complete", "脱出できました", "終幕まで到達しました。", "最後の車内、使った切符、携帯電話の写真を見直せます。脱出のために必要な操作は、すべて終わっています。");
    if (s.room === 'return') {
        const t = s.values.returnTrip?.[0] ?? 0;
        return t < 10 ? hint("return-travel", "到着を待つ", "列車は走行中です。少し待つと、窓の外の景色が変わります。", "待っている間に携帯電話の写真を開き、帰る場所の景色を確かめてください。")
            : t < 12 ? hint("return-arrived", "扉が開くのを待つ", "列車が止まりました。扉が開くまでもう少し待ってください。", "窓の外の駅名や建物を、携帯電話の写真と見比べられます。")
            : hint("return-exit", "ホームへ降りる", "扉が開きました。車内の開いた扉を押すと降りられます。", "降りる前に景色を確かめたい場合は、窓の外と携帯電話の写真を見比べてください。");
    }
    if (s.train.position === 'approaching') return hint("train-approaching", "列車の到着を待つ", "列車が近づいています。北ホームで到着を待ってください。", "灯具の配置を変えず、列車が止まるか通過するかを確認してください。");
    if (s.train.position === 'passing' || s.train.position === 'leaving') return hint("train-wait", "列車が去るのを待つ", "列車が通り過ぎるまで待ってください。", "列車が去ると、もう一度呼び出せます。止まらなかった場合は、呼び出した便・灯具の位置・遮光器・ベルの切替を見直してください。");
    if (s.train.position === 'stopped') {
        if (!boardingGeometry(s.train, s.signals, signalReady(s))) return hint("train-reposition", "扉と踏み板を合わせる", "列車は止まっていますが、扉の位置が踏み板に合っていません。", "止まった後に灯具を動かしても、列車は動きません。一度列車を送り出し、2つの扉がどちらも踏み板の上に来るよう灯具の位置を変えてから、呼び直してください。");
        if (!liveCircuit(s)) return hint("bell-live", "ベルの反応を比べる", "接点ⅠとⅡを切り替え、それぞれでベルを違う間隔で押してください。", "記録紙の「押」と「返」を比べます。毎回同じ間隔で返る接点と、押した間隔に合わせて返る接点があります。自分の操作に合わせて返る方を選んだままにしてください。");
        if (!s.mounted && validTicket(s, s.draft)) return readerHint(s);
        if (!validTicket(s, s.mounted)) return ticketHint(s);
        if (s.values.readerClamp?.[0] !== 0) return hint("reader-close", "切符を固定する", "切符受けの押さえを閉じ、券を固定してください。", "券が奥まで入っていることを確認し、押さえを閉じてください。その後、北ホームの踏み板から乗車を試せます。");
        return hint("board", "列車に乗る", "北ホームの踏み板へ近づき、開いた扉を押してください。", "踏み板から足を渡せる位置にある扉を選ぶと乗車できます。");
    }
    const candidates: Candidate[] = [];
    const add = (h: ProgressHint, rooms: Room[], focuses: Focus[] = []) => candidates.push({ ...h, rooms, focuses });
    if (focus === 'signal' && signalReady(s) && !liveCircuit(s))
        add(hint("signal-power", "装置の奥を観察する", "羽根の奥にあるものを、明るさも含めて観察してください。", "光が見えない理由は、羽根の位置だけでしょうか。小屋で調べた配線も思い出してください。"), ['north'], ['signal']);
    const office = s.flags.includes('officeUnlocked') || visited(s, ['office', 'lost', 'cargo', 'passage', 'north', 'tunnel']);
    const north = visited(s, ['north', 'tunnel']);
    const routeOK = trace(s.route).end === 'O';
    const ticketOK = validTicket(s, s.mounted ?? s.draft);
    if (s.flags.includes('officeUnlocked') && !visited(s, ['office', 'lost', 'cargo', 'passage', 'north', 'tunnel'])) add(hint("office-enter", "駅務室に入る", "駅務室の鍵は開いています。扉の取っ手を動かしてください。", "鍵穴ではなく、取っ手を押すと扉が開いて中に入れます。"), ['waiting'], ['officeLock']);
    if (!office) add(arrivalHint(s), owns(s, 'officeKey') ? ['waiting'] : ['train'], ['bag', 'receipt', 'seat', 'photos', 'case', 'officeLock']);

    if (office && !ticketOK && !owns(s, 'fragments')) {
        const open = on(s, 'receiptOpen'), ready = receiptTrayReleases(s.values.receiptSlots ?? receiptInitial);
        add(open ? hint("fragments-take", "券の断片を取る", "開いた受取棚の引出しから、券の断片を取ってください。", "取った断片は、忘れ物室の比較台や持ち物から広げて調べられます。")
            : ready ? hint("receipts-pull", "受取棚の引出しを開ける", "受取票の並びは合っています。棚の留めを引いてください。", "票を入れた枠の下にある留めを動かすと、引出しを開けられます。")
            : hint("receipts-order", "時計のずれを直して票を並べる", "受取票の時刻をそのまま比べず、どちらの時計で読んだ時刻か確認してください。", "2枚の時計写真は同時に撮影されています。写真下の撮影時刻と針の時刻を比べて、各時計が何分進んでいるか・遅れているかを求めます。そのずれを票の時刻から直し、実際の受付順に並べてください。票の下の切欠きも確認できます。"),
            ['lost'], ['receiptTray', 'clockChecks', 'fragments']);
    }
    if (office && (s.locations.spareLamp === 'cargoChest' || !routeOK && s.locations.cargoDocket === 'cargoChest'))
        add(cargoHint(s), ['waiting', 'cargo', ...(s.locations.knob !== 'recorder' ? ['office' as const] : [])], ['hatch', 'counterDrawer', 'notices', 'recorder', 'cargoChest', 'cargoDockets']);

    const needShed = !obtained(s, 'lamp', 'lightRack') || !obtained(s, 'hood', 'balanceChest') || !obtained(s, 'retainingPin', 'balanceChest');
    if (needShed && !on(s, 'shedOpen') && !visited(s, ['lamp'])) add(shedHint(s), ['forecourt'], ['noticeBoard', 'posters', 'shedDoor']);
    else if (needShed) {
        if (s.locations.lamp === 'lightRack') add(hint("lamp-take", "小屋の灯具を取る", "灯具小屋の壁に掛かっている灯具を取ってください。", "持ち物に入れた灯具は、窓辺や北ホームの受け口に取り付けられます。使った後も取り外して持ち運べます。"), ['lamp']);
        if (s.locations.hood === 'balanceChest' || s.locations.retainingPin === 'balanceChest') {
            const names = [s.locations.hood === 'balanceChest' ? '覆い' : '', s.locations.retainingPin === 'balanceChest' ? '保持ピン' : ''].filter(Boolean).join('と');
            add(on(s, 'balanceOpen') ? hint("balance-take", "保管箱の中身を取る", "開いた保管箱の中にある" + names + "を取ってください。", "箱の底にある覆いと小さな保持ピンは、別々に取ります。残っている方を押してください。")
                : balanceReleases(s.values.balancePositions ?? [1, 1]) ? hint("balance-release", "保管箱の留めを外す", "天秤が釣り合っています。そのまま蓋の留めを動かしてください。", "重りを動かさずに留めを操作すると、保管箱を開けられます。")
                : hint("balance", "天秤を釣り合わせる", "左右の重りは、重さに合わせて支点からの距離を変える必要があります。", "重い重りは支点に近く、軽い重りは遠くへ動かしてください。左右それぞれの「重さ×支点からの距離」が等しくなる位置を探します。"),
                ['lamp'], ['balanceBox']);
        }
    }
    if (office && !north) {
        if (s.room === 'passage' || on(s, 'stairDoor') && !on(s, 'gateOpen'))
            add(hint("north-underpass", "地下通路から北ホームへ進む", "地下通路を北へ進み、階段の上にある蓋を調べてください。", "北の踊り場で蓋を押し開けると、北ホームへ上がれます。"), ['passage', 'cargo']);
        else add(gateHint(s), ['bridge', ...(s.locations.hook === 'toolRack' ? ['office' as const] : [])], ['hookRack', 'railTag', 'bridgeGate']);
        if (s.room === 'cargo') add(on(s, 'cargoOpen') ? hint("cargo-close-lid", "荷物を動かせる状態にする", "幅広い木箱の蓋が開いているため、その箱を動かせません。", "中の物を取ってから蓋を閉じ、床の溝に沿って箱を動かしてください。")
            : stairsClear((s.values.cargo ?? cargoInitial) as Cargo) ? hint("cargo-stairs", "奥の階段戸を開く", "荷物が動き、奥の木戸までの道が空いています。", "奥の木戸を押して開き、階段を下りてください。")
            : hint("cargo-path", "階段戸までの道を空ける", "荷物を動かして、部屋の奥にある階段戸までの通路を空けてください。", "それぞれの荷物は、床の溝に沿った方向だけに動きます。空き場所を作りながら順に動かしてください。木箱の蓋が開いている場合は、閉じてから動かします。"), ['cargo']);
    }
    if (north) {
        if (!routeOK) add(owns(s, 'envelope')
            ? hint("route", "帰りの線路をつなぐ", "分岐の操作札と、線路を観察した記録を見比べてください。", "携帯電話の写真に写っている駅名を、略図の行先と見比べてください。どこへ帰るための線路を探すのかが分かります。\n\n操作札の中央は、そのレバーが動かす分岐です。外側の記号は隣の分岐を表します。駅から順に、入ってくる線と次へ進む線が太い線でつながるように考えてください。\n\n略図に自分で引いた線は、考えた経路のメモです。線を引けたことだけでは、実際につながっているとは限りません。札の「？」は、地下横断通路の北側の踊り場の窓や、跨線橋・北ホーム東端から見える線路を比べて確かめてください。\n\nつながっていても、貨車が留置されている区間は通れません。跨線橋から見える貨車と経路控を照らし合わせ、その区間を避けて行先までたどれるか確認してください。")
            : envelopeHint(s), ['north', 'tunnel'], ['points', 'routeSketch', 'map', 'crossing', 'freight', 'northTracks', 'passageWindow', 'cargoDocket']);
        if (s.signals.mounts.some(m => m === null) && obtained(s, 'lamp', 'lightRack') && obtained(s, 'spareLamp', 'cargoChest')) {
            const places: Record<string, string> = { lightStand: '灯具小屋の窓辺', glassStand: '側道の観測窓' };
            const left = (['lamp', 'spareLamp'] as const).find(item => places[s.locations[item] ?? '']);
            add(left ? hint("lamps-retrieve", "灯具を回収する", places[s.locations[left]!] + "に取り付けた灯具を回収してください。", "取り付けた場所の受け口を押すと、灯具を外せます。北ホームでは灯具と交換灯具の2つを使います。")
                : hint("lamps-mount", "北ホームに2つの灯具を付ける", "灯具と交換灯具を、北ホームの別々の受け口へ取り付けてください。", "運行控の車体資料で扉の間隔を調べてください。2つの灯具の位置によって停車位置が変わるので、両方の扉が踏み板に合う配置を考えます。"), ['north', 'tunnel', 'lamp'], ['signal']);
        }
        if (!signalReady(s) && obtained(s, 'hood', 'balanceChest') && obtained(s, 'retainingPin', 'balanceChest'))
            add(hint("signal-fit", "遮光器に部品を取り付ける", "覆いと保持ピンを、北ホームの遮光器に取り付けてください。", "装置の右端にある取付部を調べ、持ち物から部品を選んで使ってください。取り付けた後は、内側の2枚の羽根を動かせます。"), ['north'], ['signal']);
        else if (signalReady(s) && !illuminatedPorts(s.signals, true).every(Boolean))
            add(hint("signal-shutters", "羽根と奥の金具を観察する", "動かしたときに、動く部分と動かない部分を見比べてください。", "穴の重なりだけでなく、その奥に何があるかを確かめてください。"), ['north'], ['signal']);
        if (!liveCircuit(s)) add(hint("bell-live", "ベルの反応を比べる", "接点ⅠとⅡを切り替え、それぞれでベルを違う間隔で押してください。", "記録紙の「押」と「返」を比べます。毎回同じ間隔で返る接点と、押した間隔に合わせて返る接点があります。自分の操作に合わせて返る方を選んだままにしてください。"), ['lamp'], ['bell']);
        if (routeOK && signalReady(s) && s.signals.mounts.every(m => m !== null) && illuminatedPorts(s.signals, true).every(Boolean) && !boardingGeometry(stopAt(2, s.signals, true, true), s.signals, true))
            add(hint("signal-spacing", "2つの扉を踏み板に合わせる", "灯具の間隔だけでなく、列車が止まる位置も確認してください。", "運行控の車体資料を見て、両方の扉がそれぞれの踏み板に収まるよう灯具を配置します。扉の中心が板の端に来る配置では乗れません。"), ['north'], ['signal', 'dispatch']);
        if (routeOK && !ticketOK) add(ticketHint(s), ['office', 'north'], ['ticket', 'tools', 'journeyRecords', 'reader', 'paperView']);
        if (routeOK && ticketOK) {
            if (!s.mounted) add(readerHint(s), ['north'], ['reader']);
            else if (s.values.readerClamp?.[0] !== 0) add(hint("reader-close", "切符を固定する", "切符受けの押さえを閉じ、券を固定してください。", "券が奥まで入っていることを確認し、押さえを閉じてください。その後、北ホームの踏み板から乗車を試せます。"), ['north'], ['reader']);
        }
    }
    // Optional observations are offered only while the player is examining them.
    if (focus === 'lampWindow') add(lampObservationHint(s), [], ['lampWindow']);
    if (focus === 'fragments' && owns(s, 'fragments') && !ticketOK) add(hint("fragments-compare", "券の断片を見比べる", "破れ目だけで組み合わせず、同じ券の断片かどうかも確認してください。", "紙の表裏、列の罫線、穴の形と位置を比べます。同じ束にあった写真も手がかりです。途中の並びは「配置の写しを残す」で保存して見比べられます。"), [], ['fragments']);
    const contextual = focus ? candidates.find(h => h.focuses.includes(focus)) : undefined;
    const selected = contextual ?? candidates.find(h => h.rooms.includes(s.room)) ?? candidates[0];
    if (selected) return { id: selected.id, title: selected.title, clues: selected.clues };
    if (!north) return hint("explore", "まだ調べていない場所を探す", "左右の矢印で向きを変え、まだ入っていない出入口を探してください。", "物を拡大しているときは「戻る」で周囲の景色に戻れます。調べられる位置が分からないときは「調べる場所」を押してください。");
    if (s.values.callService?.[0] === 2) return hint("call", "列車を呼び出す", "呼出ボタンを押して、北ホームで列車を待ってください。", "列車が止まったら、踏み板へ近づいて開いた扉を押してください。");
    return hint("service", "帰るための便を選ぶ", "携帯電話の写真で行先を確かめ、運行控と方向票から、この駅に停車する便を探してください。", "行先、予鈴と停車の順番、車体の種類を比べて便を選びます。呼出機をその番号に合わせてボタンを押し、北ホームで待ってください。");
}

export function getProgressHint(s: State, focus: Focus = null): ProgressHint { return stagedHint(baseProgressHint(s, focus), s); }
