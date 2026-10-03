import { expectedHoles, trace } from './model';
import type { State } from './model';
import type { ProgressHint } from './progressHints';
import { cargoCode, cargoEventNames } from './cargoDockets';
import { eventOrder } from './recordings';
import { cargoInitial, moveCargo, stairsClear } from './cargo';
import type { Cargo } from './cargo';
import { initialPhotoOrder } from './arrivalPhotos';
import { pointNames } from './pointMechanics';

const homeRoute = [0, 1, 0, 1, 1, 1];
const cargoNames = ['長い木箱', '幅広い木箱', '空の台車', '車輪付きの棚'];
export function cargoHintMoves(start: Cargo): { index: number; direction: number }[] {
    const queue = [{ state: start, moves: [] as { index: number; direction: number }[] }], seen = new Set([start.join(',')]);
    for (let at = 0; at < queue.length; at++) {
        const current = queue[at];
        if (stairsClear(current.state)) return current.moves;
        for (let index = 0; index < 4; index++) for (const direction of [-1, 1]) {
            const next = moveCargo(current.state, index, direction);
            if (next && !seen.has(next.join(','))) { seen.add(next.join(',')); queue.push({ state: next, moves: [...current.moves, { index, direction }] }); }
        }
    }
    return [];
}
function cargoAnswer(s: State) {
    const moves = cargoHintMoves((s.values.cargo ?? cargoInitial) as Cargo);
    const grouped: { index: number; direction: number; count: number }[] = [];
    for (const move of moves) {
        const last = grouped.at(-1);
        if (last && last.index === move.index && last.direction === move.direction) last.count++;
        else grouped.push({ ...move, count: 1 });
    }
    return '今の配置からなら、次の順に動かせます。1区画ずつドラッグしてください。\n\n' + grouped.map((m, i) => `${i + 1}. ${cargoNames[m.index]}を${m.index === 1 || m.index === 2 ? m.direction > 0 ? '右' : '左' : m.direction > 0 ? '奥' : '手前'}へ${m.count}区画。`).join('\n\n') + '\n\n通路が空いたら、奥の木戸を押してください。';
}
export function ticketAnswer(s: State) {
    const route = trace(s.route).end === 'O' ? s.route : homeRoute;
    return (trace(s.route).end === 'O' ? '今つないでいる経路に対応する券は、次の内容です。' : 'まず分岐のヒントで帰路をつないでください。菱形→三角形→丸形→長方形→半円形の経路なら、次の券を使えます。') +
        '\n\n鋏はⅡを使い、券は表を向けます。Ⅰ列から順に、次の形と縁で切ってください。\n\n' +
        expectedHoles(route).map(h => `${['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ'][h.column]}列：${pointNames[h.node]}。切欠きから${h.side === 'white' ? '近い' : '遠い'}縁。`).join('\n\n') +
        '\n\n便印は「2」を押します。別の便印や余分な穴がある券は、机の紙束から一枚取り直してください。表を向けた券を持ち物で選び、押さえを開いた切符受けへ差し込み、押さえを閉じます。';
}
/** Add opt-in depth without changing the selected task or any game state. */
export function stagedHint(base: ProgressHint, s: State): ProgressHint {
    let clues: ProgressHint['clues'] | undefined;
    switch (base.id) {
        case 'arrival-seat': clues = [
            '受取票には、車内のある場所を示す言葉が書かれています。',
            '扉の種類を確かめ、その扉側から座席を数えてください。',
            '二枚扉側から三番目の座席です。座席の背を動かし、裏のポケットにある封筒を押して取ってください。']; break;
        case 'arrival-case': clues = [
            '4枚の写真は、表の景色だけでなく裏側も手掛かりです。',
            '裏に写っている切符を、同じ列どうしで比べてください。穴がまだない写真と、すでにある写真があります。',
            '一度開いた穴は消えません。「穴がない→穴がある」の順になるように4枚を並べます。その後、表の景色と封筒の見取図を比べます。',
            '撮影順は、坑口→塔を東から撮った写真→塔を西から撮った写真→踏切です。今の一覧番号では ' + [0, 1, 2, 3].map(id => (s.values.photoOrder ?? initialPhotoOrder).indexOf(id) + 1).join('→') + ' です。',
            '書類箱の四つの輪を、左から「西・東・西・北」に合わせてください。最後に輪の横の留めを動かすと開きます。']; break;
        case 'drawer-code': clues = [
            '壁と窓口にある紙を、時刻だけでなく日付にも注目して比べてください。',
            '受付日は九月八日です。その日に有効な時刻表を選び、運休の掲示も確認します。',
            '九月の時刻表では、最終の臨時便は九月八日に運休しています。その一つ前の便を使います。',
            '最後に使える受付時刻は21時46分です。引出しの輪を左から「2・1・4・6」に合わせ、引出しの取っ手を引いてください。']; break;
        case 'cargo-code': clues = [
            '録音の記録紙と、木箱の荷札を一緒に調べてください。',
            'AとBの「閉鎖」の印を比べます。丸が二つ点いた印どうし、一つ点いた印どうしが重なるように、記録紙Bを横へ動かします。',
            'Bの左端をAより右へ3目盛りずらした位置で、共通する出来事がそろいます。' + ((s.values.tapeOffset?.[0] ?? 0) === 3 ? '今の位置で合っています。' : '今の位置からは' + ((s.values.tapeOffset?.[0] ?? 0) < 3 ? '右' : '左') + 'へ' + Math.abs(3 - (s.values.tapeOffset?.[0] ?? 0)) + '目盛り動かしてください。'),
            '使うのは丸い路線印の「受領」の荷札です。「通過控」や三角印の札は使いません。出来事の順は ' + eventOrder(3).map(e => cargoEventNames[e]).join('→') + ' です。',
            '木箱の輪を、左から「' + cargoCode().join('・') + '」に合わせてください。輪の横の留めを動かすと開きます。']; break;
        case 'shed-code': clues = [
            '掲示板の右側にある4枚の紙を見比べてください。',
            '数字だけを先に読むと候補が多くなります。まず絵の続き方と、紙の縁の穴を比べます。',
            '左に「丙」、右に「甲」を置き、両方を表向きにしてください。つなぎ目に同じ数字が並びます。',
            'つなぎ目を上から読むと「4・7・0・6」です。小屋の錠へ入力し、右側の留めを動かしてください。']; break;
        case 'receipts-order': clues = [
            '4枚の受取票には、時刻と、その時刻を読んだ時計が書かれています。',
            '比較台の2枚の時計写真は同時に撮られています。写真下の時刻と、各時計の針を比べてください。',
            '撮影時刻は23:14。ホーム時計は3分進み、室内時計は2分遅れています。ホームの票は3分引き、室内の票は2分足して比べます。',
            '実際の時刻は、青23:12→赤23:14→透明23:15→黒23:16。受取棚のⅠ〜Ⅳへこの順で置き、下の留めを引いてください。']; break;
        case 'balance': clues = [
            '左右の重りは、重さが違います。吊るす位置も変えられます。',
            '支点から遠いほど、重りが棒を傾ける力が大きくなります。重い方を近く、軽い方を遠くへ掛けます。',
            '左は重さ2、右は重さ3です。「重さ×支点からの距離」を左右で同じにします。',
            '左の重り2を支点から3番目、右の重り3を2番目へ掛けてください。2×3と3×2が等しくなります。釣り合ったら、蓋の留めを動かしてください。']; break;
        case 'cargo-path': clues = [
            '奥の階段戸へ続く床の溝を見て、邪魔になっている荷物を確かめてください。',
            '荷物ごとに動かせる方向が決まっています。まず空き場所を作り、別の荷物の移動先に使います。',
            cargoAnswer(s)]; break;
        case 'route': clues = [
            '帰る行先と、線路が実際につながっている場所を確かめてください。',
            '行先は携帯の写真に写る白沢です。分岐札では中央が操作している分岐、周囲が隣の分岐です。駅から来た線と次の線がつながる位置を選びます。',
            '札の「？」は、地下の踊り場の窓・跨線橋・北ホーム東端から線路を見比べます。貨車のある給水槽―鉄塔の区間は通れません。',
            '通れる経路の一つは、駅→踏切→給水槽→分岐橋→トンネル→鉄塔→白沢です。記号なら、駅→菱形→三角形→丸形→長方形→半円形→白沢です。',
            '六つのレバーを、菱形Ⅰ・三角形Ⅱ・星形Ⅰ・半円形Ⅱ・丸形Ⅱ・長方形Ⅱへ合わせてください。この設定で白沢への帰路がつながります。切符も、この経路に合わせて作ってください。']; break;
        case 'ticket-tool': clues = [
            '三本の鋏を同じ刃で試すと、穴の輪郭の違いを比べられます。',
            '形の中央に切り残しがないか、輪郭が横にはみ出していないかを見てください。',
            'きれいな穴を作れるのはⅡの鋏です。机のⅡを選び、そのまま「切符を作る」へ切り替えてください。']; break;
        case 'ticket-derive': case 'ticket-check': case 'ticket-recheck-mounted': clues = [
            base.id === 'ticket-recheck-mounted' ? '差し込んだ券と、今の帰り道が合っているかを確認してください。' : '帰り道で通る地点の順番と、券の列を対応させてください。',
            '乗車券控は、選んだ列の連写と、加工済みの券の部分写しです。撮影手帖の1から2へ進む間に通過した標柱を特定し、同じ列の穴と比べます。甲と乙の給水槽では、通る標柱と穴の縁がどう変わっていますか。',
            '表向きの部分写しでは、白い一本帯の標柱を通る列の穴は切欠きに近い縁、黒い二本帯なら遠い縁にあります。写真の左右や、次に出る線ではなく、進入する線の標柱を使います。北ホームで各レバーの操作札を広げ、帰路で一つ前に通る地点から中央へ入る線を見てください。',
            'Ⅱの鋏を使い、便印は帰りの便に合わせます。取り付けた券は押さえを開いて回収すると、同じ券を机で加工し直せます。余分な穴と別便の印は消せません。',
            ticketAnswer(s)]; break;
        case 'fragments-compare': clues = [
            '六枚は、同じ一枚の券から取れたとは限りません。',
            '破れ目だけでなく、罫線・細い傷・穴の形を比べてください。裏返しや半回転も試せます。',
            '二枚の券の、Ⅲ〜Ⅴ列に当たる部分です。最後の二地点は共通でも、その前に通った区間が違います。',
            '下の選択欄の左から1〜3枚目で一組、4〜6枚目でもう一組です。それぞれ表向き・文字が読める向きにし、上端・中央・下端の順に合わせます。二組のⅢ列は丸形ですが切る縁が違い、Ⅳ列は長方形、Ⅴ列は半円形です。']; break;
        case 'signal-shutters': clues = [
            base.clues[0], base.clues[1],
            '上下の持ち手は別々の羽根を動かします。二つの穴が重なるだけでなく、奥に固定された二つのガラスが穴から見える位置を探します。',
            '上の持ち手を左端から3番目、下の持ち手を4番目へ合わせてください。穴の奥にガラスが見えます。暗いままなら、小屋のベルの切替をⅡにして戻ってください。']; break;
        case 'bell-live': case 'signal-power': clues = [
            base.id === 'signal-power' ? 'その奥のガラスが暗いときは、羽根以外の原因も考えてください。' : '小屋のベルには二つの切替位置があります。反応を比べてください。',
            '接点を切り替え、違う間隔でベルを何度か押します。記録紙の「押」と「返」で、自分の間隔が返ってくる方を探してください。',
            '切替をⅡへ合わせて、そのままにしてください。Ⅱ側が停車灯へ電源を送ります。ベルを鳴らし続ける必要はありません。']; break;
        case 'signal-spacing': case 'train-reposition': case 'lamps-mount': clues = [
            base.clues[0],
            '灯具の位置が、止まる列車の扉の位置になります。車体資料の扉間隔と、ホームの二つの踏み板を比べてください。',
            '帰りに使う車体の扉間隔は4m。二つの扉が、それぞれ踏み板の中央に来る配置を考えます。',
            '灯具を7と11の取付穴へ一つずつ付け、呼出番号を2にしてください。すでに列車が止まっている場合は「列車を送り出す」で去らせ、配置を直して呼び直します。白沢への線路・遮光器・給電も整っている必要があります。']; break;
        case 'service': clues = [
            '携帯の写真で帰る駅名を確認し、運行控と方向票を比べてください。',
            '行先が合うだけでなく、予鈴の後に停車する便を選びます。車体の扉間隔も、二つの踏み板に合う必要があります。',
            '白沢方面・予鈴の後に停車・扉間隔4mを満たすのは第2便です。呼出機の輪を2に合わせ、呼出ボタンを押してください。切符の便印も2を使います。']; break;
    }
    return clues ? { ...base, clues } : base;
}
