import type { Room } from './model';
export type Kind='slide'|'order'|'dial'|'map'|'clock'|'routeCode'|'timeline'|'notices'|'hook'|'crates'|'classify'|'punchSelect'|'tickets'|'lampAngle'|'balance'|'ticketTrial'|'reflection'|'shutters'|'schedule'|'route'|'traces'|'height'|'segments'|'punch'|'signal'|'rings'|'departure'|'arrival';
export interface Puzzle {id:string;title:string;room:Room;kind:Kind;intro:string;clue:string;hints:[string,string,string];answer:number[];labels?:string[];choices?:string[];surface:'metal'|'paper'|'wood'|'route'|'ticket';}
export const puzzles: Puzzle[]=[
 {id:'P01',title:'荷物棚の箱',room:'train',kind:'slide',intro:'二つの爪が、ふたを押さえている。',clue:`横の爪には縦の爪が通る切れ目がある。`,hints:['爪が重なっている場所を見る。','横の爪の切れ目を、縦の爪に合わせてから動かす。','横の爪を中央へ。縦を下へ退避してから、横を右端へ。'],answer:[2,2],surface:'metal'},
 {id:'P02',title:'座席の鞄',room:'train',kind:'classify',intro:'留め具は、受取札と同じ三つの形。',clue:`札の裏：預入時、取っ手を窓へ。補修は駅側。札の欠けた角は上。
三つの刻印は、取っ手側・補修側・底側から読む。`,hints:['鞄を置かれた向きのまま読まない。','札の「上」と、預けた時の取っ手の向きを揃える。','取っ手側の△、補修側の二本線、底の○の順。'],answer:[1,3,0],choices:['○','△','□','Ⅱ'],surface:'wood'},
 {id:'P03',title:'五枚の車窓',room:'train',kind:'order',intro:'写真は撮った順には入っていない。',clue:`写真の包みに一行。「遮断機が一度閉じる間、連写した。」`,hints:['線路の脇にある物ではなく、動いている物を見る。','遮断機と貨車の前後が時間の手掛かり。','遮断機上 → 塔と貨車先頭 → 給水槽と尾灯 → 塔と遠ざかる貨車 → 遮断機下。'],answer:[2,4,0,3,1],surface:'paper'},
 {id:'P04',title:'窓口の格子',room:'waiting',kind:'slide',intro:'横棒が引き手に当たる。',clue:`横棒の切れ目だけ、縦の引き手を通せる。`,hints:["引き手の通り道を、上の出口から逆にたどる。","中央の横桟を通れる位置は限られる。上下の可動棒をその道へ合わせる。","上下の切れ目を左から5本目へ。引き手を右へ4、上へ4、右へ2。"],answer:[2,2],surface:'metal'},
 {id:'P05',title:'窓口の引出し',room:'waiting',kind:'dial',intro:'「本日の最終受付」の下に四桁の錠。',clue:`窓口の日付票は「九月八日」。
旧表：八月一日改訂　20:16・21:40・22:15
新表：九月一日改訂　20:28・21:36・22:08
運休票：九月八日　最終便は運休。`,hints:['二枚の表のどちらが今日使われるか。','最終便が運休なら、最後に残る受付はどれか。','九月の表から22:08を除く。21:36。'],answer:[2,1,3,6],surface:'wood'},
 {id:'P06',title:'案内図の裏',room:'waiting',kind:'map',intro:"固定された案内図の間に、薄い写しが挟まっている。",clue:"改札が西、欠けた窓が東。薄紙の印刷は裏からも透けて見える。灯りにかざすと、点の光が紙全体に広がる。",hints:['紙を回すことと、裏返すことは違う。','改札と欠けた窓の両方が合う面を見る。','左右を反転する。上下は変えない。'],answer:[1,0],surface:'paper'},
 {id:'P07',title:'ホームの時計',room:'platform',kind:'slide',intro:'巻き軸に、二枚の扇形の爪が重なる。',clue:"二枚の扇板は切れ目でだけすれ違える。中央に巻き軸。",hints:["内側だけを回そうとすると、外の板に当たる。","外側を半回転させると、内側が動く。","外側を2回、内側を3回、外側を2回。巻き軸を回す。"],answer:[0,3],surface:'metal'},
 {id:'P08',title:'車内の路線ケース',room:'train',kind:'routeCode',intro:'五つの沿線印。塔の印には、梯子の左右がある。',clue:`ケースの銘板：沿線印を、通った順に。保守図：塔の梯子は西面。車内の進行札：→。`,hints:['写真の順番と、地図の向きを別々に考える。','塔は二基ではない。梯子と、手前の柱の重なりを照合する。','踏切 → 塔の西側 → 給水槽 → 塔の東側 → 踏切。'],answer:[0,1,3,2,0],choices:['踏切','塔・西','塔・東','給水槽','隧道'],surface:'metal'},
 {id:'P09',title:'工具掛け',room:'office',kind:'hook',intro:'鉤の輪が、曲がった掛け金から抜けない。',clue:"輪を溝に沿わせれば、掛け金の先まで動かせる。",hints:['輪をいったん根元へ戻せる。','障害物を避け、下の溝を通る。','下、下、右、右、上、右、右。'],answer:[4,1],surface:'metal'},
 {id:'P10',title:'忘れ物の傘',room:'lost',kind:'order',intro:'受取札は四枚。傘は、持ち手を奥へ向けてしまわれていた。',clue:`受取票には二種類の時計印。受け取った場所の時計で記録した時刻。青23:10駅務、赤23:17ホーム、透明23:13駅務、黒23:19ホーム。`,hints:['受取票の時計印を、駅の二つの時計と比べる。','駅務は2分遅れ、ホームは3分先。時刻を同じ基準へ直す。','実時刻は青23:12、赤23:14、透明23:15、黒23:16。'],answer:[2,0,3,1],labels:['赤','黒','青','透明'],surface:'wood'},
 {id:'P11',title:'二つの時計',room:'office',kind:'clock',intro:'遮断機の閉じた瞬間だけ、二つの記録が一致する。',clue:`同時撮影の時計：ホーム23:17、駅務室23:12。標準記録23:14。時計の数字をそのまま録音順に使うと前後が逆になる。`,hints:['同時の出来事に映った数字を比較する。','ホームは標準より3分先、駅務室は2分遅れ。','補正：ホーム −3、駅務室 ＋2。'],answer:[3,8],choices:['−6','−5','−4','−3','−2','−1','0','＋1','＋2','＋3','＋4','＋5'],surface:'paper'},
 {id:'P12',title:'放送の記録機',room:'office',kind:'timeline',intro:'二本の記録は、途中から始まっている。',clue:`記録機の銘板：Aはホーム、Bは駅務室。目盛りは、それぞれの記録開始から。保管棚の刻印は、実際に起きた出来事の順。`,hints:['同じ遮断機の動きを、二本で揃える。','閉鎖が二度ある。欠けた点滅で同じ回を識別できる。','BをAより4目盛り右へ。実順は扉閉 → 通過 → ベル → 停止。'],answer:[4,0,1,2,3],surface:'wood'},
 {id:'P13',title:'貼り替えられた掲示',room:'forecourt',kind:'notices',intro:'古い紙の輪郭だけが、壁に白く残る。',clue:`四枚の端に取付穴。片方の右の穴と、もう片方の左の穴が同じ高さでつながる。表の数字は切れているが、正しい二枚なら一つになる。`,hints:['数字の形より、穴と退色した外周を先に合わせる。','二つの穴の間隔が同じ組は一組。','左は三枚目、右は一枚目。重ねると4706。'],answer:[2,0],surface:'paper'},
 {id:'P14',title:'手すりの向こう',room:'platform',kind:'hook',intro:'札の穴に鉤を通せそうだ。間に細い横桟がある。',clue:"棒は手元を支点に伸ばせる。垂れた支柱の下を通り、先の鉤だけを札の穴へ入れる。",hints:["棒の途中が横桟を貫かない角度を探す。","急角度では支柱に当たる。浅く差し込んでから伸ばす。","角度は左から3、長さは最大、鉤は上向き。"],answer:[2,3,1],surface:'metal'},
 {id:'P15',title:'橋の閉鎖柵',room:'platform',kind:'slide',intro:'解除片が軸にはまる。二本の止めを外せる。',clue:`横止めの切欠きへ縦止めを通す。外れた金具は持ち出せる。`,hints:['二本を同じ向きへ動かしても外れない。','交点に切欠きを合わせる。','横を中央、縦を下、横を右へ。'],answer:[2,2],surface:'metal'},
 {id:'P16',title:'駅の見取り図',room:'bridge',kind:'map',intro:'窓の数と、屋根の奥行きが合わない。',clue:`古い図面には三つの区画しかない。低い屋根は通路の上。柱は区画の境に立つ。写真と図を見比べる。`,hints:['同じ欠けた窓を、平面と外観で探す。','東端の窓の奥に、図にない北側の通路がある。','原図の細い右端の列を下から上へ三つ、そこから左へ一つ。表裏や描く順番は問わない。'],answer:[1,3],surface:'paper'},
 {id:'P17',title:'荷物通路の台車',room:'office',kind:'crates',intro:'三つの重い箱が、台車の進む溝を塞いでいる。',clue:"三箱は縦の溝、台車は横の溝だけを動く。物同士は通り抜けられない。",hints:["台車の横一直線を空ける。","左の長い箱は下、中央の短い箱は上、右の短い箱は下へ退避できる。","左の箱を下へ2、右の箱を下へ1。中央の箱は最上段のまま。台車を右端へ。"],answer:[0,2,0],surface:'wood'},
 {id:'P18',title:'荷札の違い',room:'store',kind:'dial',intro:'到着扱いを処理した順に、四つの荷番号。',clue:"枠の内側の印が到着、枠をまたぐ印が通過。路線札と同じ印の荷物を、記録機から読んだ出来事の順に処理する。",hints:['路線札は○。枠の内側に○があるものだけを選ぶ。','出来事の順は二本の記録から読む。印が枠をまたぐ荷物は通過扱い。','扉閉6 → 通過2 → ベル8 → 停止4。'],answer:[6,2,8,4],surface:'wood'},
 {id:'P19',title:'改札鋏の切り口',room:'office',kind:'punchSelect',intro:'三本の鋏。丸い穴に、余分な裂けが一つ。',clue:`試し紙では同じ形の穴が三枚。二枚には毎回同じ向きの裂け。正式な印は輪郭が閉じ、切り残しがない。`,hints:['刃の見た目より、切った紙を比較する。','同じ場所へ繰り返し出る裂けは記号ではない。','中央の鋏だけが、閉じた輪郭を切れる。'],answer:[1],surface:'ticket'},
 {id:'P20',title:'重なった切符',room:'lost',kind:'tickets',intro:'切欠きと、途中駅の印は揃えられる。',clue:`甲・乙・丙には、共通して通った場所がある。券の切欠きを揃え、重ねて比べられる。`,hints:['共通する二駅を重ねて比較する。','塔と給水槽は、順番が逆でも同じ形。','甲と乙は一列ずらして重なる。丙は下段に印がある。'],answer:[1,1],surface:'ticket'},
 {id:'P21',title:'トンネル前の標柱',room:'tunnel',kind:'order',intro:'柱の番号だけでは、図の向きは決まらない。',clue:"給水槽側を背にした写真。手前から8、5、2。トンネル入口の保守札には「ホ」。",hints:['番号と、曲線の向きを同時に使う。','給水槽を背に進むと数字は小さくなる。','給水槽側から8 → 5 → 2、そして隧道。'],answer:[2,1,0,3],labels:['2','5','8','隧道'],surface:'paper'},
 {id:'P22',title:'壁の向こうへ灯りを',room:'lamp',kind:'lampAngle',intro:'金具で灯具を固定できる。近い壁が光を遮る。',clue:`高い角度では庇が、低い角度では壁が邪魔する。光を壁の右の隙間へ通すと、二本の線路の合流が見える。`,hints:['光の先だけでなく、途中で遮る物を見る。','高さを中段、向きを右へ。','高さ2、向き4。'],answer:[1,3],surface:'metal'},
 {id:'P23',title:'灯具箱の重り',room:'lamp',kind:'balance',intro:'棒が傾いて、留めが噛み込んでいる。',clue:`左の重りは2、右は3。目盛りは支点からの距離。`,hints:['重さだけでなく、支点からの距離も効く。','軽い方を遠くする。','左を距離3、右を距離2へ。別の釣合いも使える。'],answer:[3,2],surface:'metal'},
 {id:'P24',title:'切符の試し紙',room:'office',kind:'ticketTrial',intro:'切欠きのある券と、何枚かの試し紙。',clue:"机の札：きさらぎ駅から、給水槽、鉄塔へ向かう片道を試す。甲から丁は使用済みの券。向きの異なる旅の穴は一枚に混ぜない。",hints:["場所と形、並び順、切欠きからの距離を分けて比較する。","段は区間の左右ではなく、きさらぎ駅へ来る旅か、駅から出る旅かで分かれる。","きさらぎ駅から出る旅は、切欠きから遠い段へ。給水槽、その右へ塔。"],answer:[2,1],surface:'ticket'},
 {id:'P25',title:'ハンドルの収納',room:'closed',kind:'slide',intro:'二枚の押さえが引出しへ重なる。',clue:"二つの押さえは同じばねにつながっている。受け金具を差せば、一方ずつ支えられる。",hints:["手を離すと戻る押さえを、金具で支える。","左を上げ、その下へ金具の先を入れておく。","左を上げる→金具を差す→右を上げる→金具を水平へ。"],answer:[1,1,2],surface:'metal'},
 {id:'P26',title:'未使用券の収納',room:'office',kind:'dial',intro:'収納には「返却分」の印。',clue:`管理帳：
発送　青印 4826　白印 1904
返却　青印 7315　白印 2608
箱の裏は青い三日月。文字のかすれた表には発送時の古い印が残る。`,hints:['箱が今使われている用途を確認する。','返却欄と、裏の新しい青印を使う。','7315。'],answer:[7,3,1,5],surface:'wood'},
 {id:'P27',title:'二つの光点',room:'tunnel',kind:'reflection',intro:'水面にも、同じ光が見える。',clue:"灯りの下に暗い金属札。水面にも同じ札の形が映っている。",hints:["水面の明るさだけでは、札の文字は読めない。","持ち運べる灯具をここで開き、上の実物を照らす。","金属札は「ト」。水面に映る逆さの印と取り違えない。"],answer:[0,1],surface:'metal'},
 {id:'P28',title:'遮光羽根',room:'closed',kind:'shutters',intro:'二つの停車位置窓へ、同時に光を通したい。',clue:"灯具の前に空の広い枠。その先に二枚の羽根と三つの窓。「停車・回送・停車」。",hints:["点の光を広げる、薄くて光を通す物が枠に入る。","待合室の薄い見取り図を枠へ。二枚の隙間が両端の停車窓で重なる位置を探す。","灯具と薄紙を取り付ける。奥の羽根は左から3、手前は左から2。"],answer:[2,1],surface:'metal'},
 {id:'P29',title:'出発欄にない便',room:'office',kind:'schedule',intro:'来た便が、そのまま戻ったとは限らない。',clue:`一便：駅→塔、戻りは通過。
二便：塔→駅、ベルのあと停止。
三便：駅→塔、ベルの前に停止。
帰り側の乗り場は北。記録機の出来事と照合する。`,hints:['記録の中でベルと停止の前後を確認する。','戻って停止する便は、出発欄では見つからない。','二便、北側。'],answer:[1,1],choices:['一便','二便','三便','南側','北側'],surface:'paper'},
 {id:'P30',title:'進路盤',room:'closed',kind:'route',intro:'途切れた一本が、帰り道につながっている。',clue:`盤の端子はイ〜ト。現場の保守札と対応する。盤の上下を、方角と取り違えない。欠けた板を入れると、ロの線がつながる。`,hints:['出発するホームと、盤の方角を揃える。','接続板とハンドルを取り付け、北側から隧道へ続く経路を作る。','北から開始。板はどちら向きでも、給水槽または小屋→塔→隧道→帰駅へつなげられる。'],answer:[],surface:'route'},
 {id:'P31',title:'列車の去った跡',room:'platform',kind:'traces',intro:'さっきは、車体の陰に隠れていた。',clue:"停まっていた車両が留置線へ下がり、ホーム中央の線路際に白い紙の角が現れた。",hints:["車体の下だった場所を見直す。","ホーム中央、線路際に紙の角が見える。","中央の紙へ鉤を伸ばす。"],answer:[1],surface:'paper'},
 {id:'P32',title:'帰り側の足元',room:'closed',kind:'height',intro:'灯りの下で、段差の違いが見える。',clue:`奥の戸は足場より高い。手前の戸は足場が切れている。中央の戸には同じ高さの踏み板が続く。`,hints:['戸の明るさではなく、足元の連続を確認する。','扉とホームの高さが同じで、踏み板が途切れない位置。','中央。'],answer:[1],surface:'paper'},
 {id:'P33',title:'まだ通っていない区間',room:'waiting',kind:'segments',intro:'切符に残る穴と、古い区間の控え。',clue:`控えの通用範囲：給水槽・鉄塔・小屋・隧道・白沢。既に通った印は引き継げる。新しい券へ同じ区間を重ねて刻まない。`,hints:['全部を逆順に写すのではない。','使用済みの給水槽と塔は、新しい券から除く。','給水槽経由なら隧道・帰駅。小屋経由なら小屋・隧道・帰駅。'],answer:[3,4,5],surface:'ticket'},
 {id:'P34',title:'帰りの切符',room:'waiting',kind:'punch',intro:'紙と鋏がある。帰りの記録を、自分で作れる。',clue:"新しく使う区間のみ有効。便の記録を添える。一枚は片道、異なる向きの旅の穴を混ぜない。切り損じの用紙は補充できる。",hints:['経路、使用済み区間、切符の向き、便の四つを照合する。','戻りは下段。使用済みの給水槽と塔は重ねて刻まない。','二便。現在の経路が給水槽経由なら、下段左から隧道・帰駅。小屋経由なら小屋・隧道・帰駅。'],answer:[],surface:'ticket'},
 {id:'P35',title:'今、鳴っている合図',room:'lamp',kind:'signal',intro:'放送のベルには、灯りがついてこない。',clue:`放送には以前の録音も残っている。発車の合図は現場灯と同時に鳴る。三つの記録は、同じ時間を写したもの。`,hints:['音の種類より、現場と同時に変わる物を探す。','録音には現場灯との同期がない。','B。'],answer:[1],surface:'wood'},
 {id:'P36',title:'券を通す受け金具',room:'closed',kind:'rings',intro:'二つの細い口が、ずれている。',clue:`紙を折らず、長辺を水平に通す。奥と手前の口を揃える。`,hints:['二つの口の両方を通せる向きにする。','片方だけ揃えても奥でつかえる。','両方を水平に。'],answer:[0,0],surface:'metal'},
 {id:'P37',title:'帰りの列車',room:'closed',kind:'departure',intro:'行先表示は、どの列車も同じだ。',clue:`同じ行先表示でも、同じ便とは限らない。運行の控えと、進入方向と合図を照合できる。`,hints:['表示より、入ってきた方向と停止の合図を確認する。','帰り券と進路が成立していることを先に確認する。','二便・北側・現場灯に同期する合図。'],answer:[1,0],surface:'paper'},
 {id:'P38',title:'降りる駅',room:'return',kind:'arrival',intro:'携帯には、帰るはずだった駅の写真が残っている。',clue:`写真：時計の後ろに黄色い自転車置場。時計は七時。今の窓：自転車置場の前を人の影が動き、時計が進む。同じ看板だけの駅は、前後関係が逆。`,hints:['駅名だけでなく、物の前後関係を見る。','止まった写真の再現と、朝が進んでいる場所を区別する。','三つ目の駅。時計の後ろが自転車置場で、生活が動いている。'],answer:[2],surface:'paper'},
];
// Door operation that consumes a discovered code; it is not counted as another puzzle.
const lampDoor:Puzzle={id:'L09',title:'灯具小屋の戸',room:'store',kind:'dial',intro:'四つの数字の下に、古い取っ手。',clue:'戸の留めには、掲示板と同じ取付穴の印。',hints:['駅前の掲示と、取付穴の形が同じ。','破れた数字だけでなく、紙の端の穴を合わせる。','4706。'],answer:[4,7,0,6],surface:'wood'};
export const puzzleById:Record<string,Puzzle>=Object.fromEntries([...puzzles,lampDoor].map(p=>[p.id,p]));
export interface Hotspot {id:string;x:number;y:number;w:number;h:number;label:string}
export interface Area {name:string;subtitle:string;links:Room[];hotspots:Hotspot[];}
const h=(id:string,x:number,y:number,w:number,h:number,label?:string):Hotspot=>({id,x,y,w,h,label:label??puzzleById[id]?.title??id});
export const areas:Record<Room,Area>={
 train:{name:'到着した車内',subtitle:'雨の音だけが、残っている。',links:['platform'],hotspots:[h('P01',24,0,13,12),h('P02',10,64,20,21),h('P08',87,13,9,25),h('window',9,19,32,32,'車窓'),h('ownTicket',52,86,8,10,'床の切符')]},
 platform:{name:'到着ホーム',subtitle:'来た方向が、分からない。',links:['train','waiting','bridge'],hotspots:[h('P07',42,3,10,16),h('P14',89,70,10,26),h('P15',16,38,15,19),h('P31',52,53,17,25)]},
 waiting:{name:'待合室',subtitle:'窓口の向こうに、誰もいない。',links:['platform','forecourt','office'],hotspots:[h('P04',50,19,24,26),h('P05',57,45,10,10),h('P06',50,19,24,26),h('P33',77,51,10,12),h('P34',86,49,13,16)]},
 forecourt:{name:'駅前',subtitle:'同じ傘が、また見える。',links:['waiting'],hotspots:[h('P13',73,51,24,26),h('loop',0,40,15,20,'駅前の道'),h('loopMarker',1,58,17,21,'赤い傘'),h('wallPhoto',31,27,62,23,'四つの窓')]},
 office:{name:'駅務室',subtitle:'ここでは、時計も違う。',links:['waiting','lost','store'],hotspots:[h('P09',19,8,6,36),h('P11',29,8,9,16),h('P12',33,47,18,16),h('P17',66,29,14,31),h('P19',53,49,11,12),h('P24',19,60,13,10),h('P26',21,72,12,9),h('P29',39,16,12,21),h('P06',51,16,13,20)]},
 lost:{name:'忘れ物室',subtitle:'持ち主のいない順番。',links:['office'],hotspots:[h('P10',9,43,24,49),h('P20',72,52,14,12)]},
 bridge:{name:'跨線橋',subtitle:'屋根が、一枚多い。',links:['platform','closed'],hotspots:[h('P16',29,36,52,42)]},
 store:{name:'荷物通路',subtitle:'届けられなかったもの。',links:['office','lamp','tunnel'],hotspots:[h('P18',24,46,28,35)]},
 lamp:{name:'灯具小屋',subtitle:'音と光が、ずれている。',links:['store'],hotspots:[h('P22',68,20,16,30),h('P23',5,38,22,57),h('P35',31,46,27,23)]},
 tunnel:{name:'隧道の側道',subtitle:'水に映る灯が、二つ。',links:['store','closed'],hotspots:[h('P21',64,40,12,53),h('P27',18,14,21,62)]},
 closed:{name:'閉鎖ホーム',subtitle:'帰るための線は、ここにある。',links:['bridge','tunnel'],hotspots:[h('P25',8,65,26,23),h('P28',60,22,10,15),h('P30',6,7,29,48),h('P32',79,68,20,28),h('P36',50,43,15,48),h('P37',38,32,4,15,'呼出機')]},
 return:{name:'帰りの車内',subtitle:'窓の外が、少しずつ明るくなる。',links:[],hotspots:[h('P38',7,17,35,37),h('P01',24,0,13,12),h('P02',10,64,20,21),h('P08',87,13,9,25),h('ownTicket',52,86,8,10,'床の切符')]},
};








