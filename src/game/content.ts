import type { Room } from './model';
export type Kind='slide'|'order'|'dial'|'map'|'clock'|'routeCode'|'timeline'|'notices'|'hook'|'crates'|'classify'|'punchSelect'|'tickets'|'lampAngle'|'balance'|'ticketTrial'|'reflection'|'shutters'|'schedule'|'route'|'traces'|'height'|'segments'|'punch'|'signal'|'rings'|'departure'|'arrival';
export interface Puzzle {id:string;title:string;room:Room;kind:Kind;intro:string;clue:string;hints:[string,string,string];answer:number[];labels?:string[];choices?:string[];surface:'metal'|'paper'|'wood'|'route'|'ticket';}
export const puzzles: Puzzle[]=[
 {id:'P01',title:'荷物棚の箱',room:'train',kind:'slide',intro:'二つの爪が、ふたを押さえている。',clue:`横の爪には縦の爪が通る切れ目がある。`,hints:['爪が重なっている場所を見る。','横の爪の切れ目を、縦の爪に合わせてから動かす。','横の爪を中央へ。縦を下へ退避してから、横を右端へ。'],answer:[2,2],surface:'metal'},
 {id:'P02',title:'座席の鞄',room:'train',kind:'classify',intro:'留め具は、受取札と同じ三つの形。',clue:`札の裏：預入時、取っ手を窓へ。補修は駅側。札の欠けた角は上。
三つの刻印は、取っ手側・補修側・底側から読む。`,hints:['鞄を置かれた向きのまま読まない。','札の「上」と、預けた時の取っ手の向きを揃える。','取っ手側の△、補修側の二本線、底の○の順。'],answer:[1,3,0],choices:['○','△','□','Ⅱ'],surface:'wood'},
 {id:'P03',title:'五枚の車窓',room:'train',kind:'order',intro:'写真は撮った順には入っていない。',clue:`同じ窓の雨筋。貨車がまだ来ない時、遮断機は上。次に貨車の先頭、最後尾。給水槽には貨車の赤い尾灯が映る。最後は遮断機が下り切っている。`,hints:['線路の脇にある物ではなく、動いている物を見る。','遮断機と貨車の前後が時間の手掛かり。','遮断機上 → 塔と貨車先頭 → 給水槽と尾灯 → 塔と遠ざかる貨車 → 遮断機下。'],answer:[2,4,0,3,1],surface:'paper'},
 {id:'P04',title:'窓口の格子',room:'waiting',kind:'slide',intro:'横棒が引き手に当たる。',clue:`横棒の切れ目だけ、縦の引き手を通せる。`,hints:['引き手を力で動かす必要はない。','横棒をずらして、引き手の通る場所を空ける。','横を中央、縦を下、横を右へ。'],answer:[2,2],surface:'metal'},
 {id:'P05',title:'窓口の引出し',room:'waiting',kind:'dial',intro:'「本日の最終受付」の下に四桁の錠。',clue:`窓口の日付票は「九月八日」。
旧表：八月一日改訂　20:16・21:40・22:15
新表：九月一日改訂　20:28・21:36・22:08
運休票：九月八日　最終便は運休。`,hints:['二枚の表のどちらが今日使われるか。','最終便が運休なら、最後に残る受付はどれか。','九月の表から22:08を除く。21:36。'],answer:[2,1,3,6],surface:'wood'},
 {id:'P06',title:'案内図の裏',room:'waiting',kind:'map',intro:'改札の位置が、目の前と逆だ。',clue:`表には「駅の外側から」。実物は改札が西、割れた窓が東。裏から光へ透かすと対応が揃う。`,hints:['紙を回すことと、裏返すことは違う。','改札と欠けた窓の両方が合う面を見る。','左右を反転する。上下は変えない。'],answer:[1,0],surface:'paper'},
 {id:'P07',title:'ホームの時計',room:'platform',kind:'slide',intro:'巻き軸に、二枚の扇形の爪が重なる。',clue:`下の爪は上の切欠きへ逃がせる。`,hints:['巻く前に、重なった爪を退避する。','切欠きで爪を通す。','横を中央、縦を下、横を右へ。'],answer:[2,2],surface:'metal'},
 {id:'P08',title:'車内の路線ケース',room:'train',kind:'routeCode',intro:'五つの沿線印。塔の印には、梯子の左右がある。',clue:`窓の進行札は右向き。塔の梯子は西側だけ。欠けた近柱が塔の右に重なる写真と、無傷の遠柱が左に重なる写真。同じ塔を反対側から見ている。`,hints:['写真の順番と、地図の向きを別々に考える。','塔は二基ではない。梯子と、手前の柱の重なりを照合する。','踏切 → 塔の西側 → 給水槽 → 塔の東側 → 踏切。'],answer:[0,1,3,2,0],choices:['踏切','塔・西','塔・東','給水槽','隧道'],surface:'metal'},
 {id:'P09',title:'工具掛け',room:'office',kind:'hook',intro:'鉤の輪が、曲がった掛け金から抜けない。',clue:`先端へ直進すると輪がぶつかる。下側の逃げ溝はつながっている。`,hints:['輪をいったん根元へ戻せる。','障害物を避け、下の溝を通る。','下、下、右、右、上、右、右。'],answer:[4,1],surface:'metal'},
 {id:'P10',title:'忘れ物の傘',room:'lost',kind:'order',intro:'受取札は四枚。傘は、持ち手を奥へ向けてしまわれていた。',clue:`乾いた青い傘は、濡れた傘より先。濡れた傘は赤→透明→黒の順に雫が重なる。棚は入口から見た順ではなく、奥から数える。`,hints:['濡れの跡に、置かれた前後が残る。','取っ手の向きを揃え、乾いた傘を先にする。','青 → 赤 → 透明 → 黒。'],answer:[2,0,3,1],labels:['赤','黒','青','透明'],surface:'wood'},
 {id:'P11',title:'二つの時計',room:'office',kind:'clock',intro:'遮断機の閉じた瞬間だけ、二つの記録が一致する。',clue:`同時撮影の時計：ホーム23:17、駅務室23:12。標準記録23:14。時計の数字をそのまま録音順に使うと前後が逆になる。`,hints:['同時の出来事に映った数字を比較する。','ホームは標準より3分先、駅務室は2分遅れ。','補正：ホーム −3、駅務室 ＋2。'],answer:[3,8],choices:['−6','−5','−4','−3','−2','−1','0','＋1','＋2','＋3','＋4','＋5'],surface:'paper'},
 {id:'P12',title:'放送の記録機',room:'office',kind:'timeline',intro:'二本の記録は、途中から始まっている。',clue:`閉鎖は二度。二度目だけ灯の点滅が欠ける。テープの頭は同時刻ではない。`,hints:['同じ遮断機の動きを、二本で揃える。','閉鎖が二度ある。欠けた点滅で同じ回を識別できる。','BをAより4目盛り右へ。実順は扉閉 → 通過 → ベル → 停止。'],answer:[4],surface:'wood'},
 {id:'P13',title:'貼り替えられた掲示',room:'forecourt',kind:'notices',intro:'古い紙の輪郭だけが、壁に白く残る。',clue:`四枚の端に取付穴。片方の右の穴と、もう片方の左の穴が同じ高さでつながる。表の数字は切れているが、正しい二枚なら一つになる。`,hints:['数字の形より、穴と退色した外周を先に合わせる。','二つの穴の間隔が同じ組は一組。','左は三枚目、右は一枚目。重ねると4706。'],answer:[2,0],surface:'paper'},
 {id:'P14',title:'手すりの向こう',room:'platform',kind:'hook',intro:'札の穴に鉤を通せそうだ。間に細い横桟がある。',clue:`手元の鉤は下からしか入らない。桟の切れ目を回り込めば、向こうの穴へ届く。`,hints:['札だけでなく、棒が通る経路を見る。','下側の隙間を回り込む。','下、下、右、右、上、右、右。'],answer:[4,1],surface:'metal'},
 {id:'P15',title:'橋の閉鎖柵',room:'platform',kind:'slide',intro:'解除片が軸にはまる。二本の止めを外せる。',clue:`横止めの切欠きへ縦止めを通す。外れた金具は持ち出せる。`,hints:['二本を同じ向きへ動かしても外れない。','交点に切欠きを合わせる。','横を中央、縦を下、横を右へ。'],answer:[2,2],surface:'metal'},
 {id:'P16',title:'図面にないホーム',room:'bridge',kind:'map',intro:'窓の数と、屋根の奥行きが合わない。',clue:`窓口の図は三つの区画。駅前の外壁には四つの窓。東端の欠けた窓は、橋から見るともう一枚の低い屋根につながる。北へ延ばせるのはこの区画だけ。`,hints:['同じ欠けた窓を、平面と外観で探す。','東端の窓の奥に、図にない北側の通路がある。','図を裏向きにし、東端から北へ延ばす。合流は給水槽の手前。'],answer:[1,3],surface:'paper'},
 {id:'P17',title:'荷物通路の台車',room:'office',kind:'crates',intro:'三つの重い箱が、台車の進む溝を塞いでいる。',clue:`箱は持ち上げられない。横の空いた床へ押せる。`,hints:['まず手前の空間を作る。','箱を退避枠へ移し、中央の通路を空ける。','それぞれの箱を左・右・左の退避枠へ。'],answer:[0,2,0],surface:'wood'},
 {id:'P18',title:'荷札の違い',room:'store',kind:'classify',intro:'「接続板・到着扱い」の箱を探す。',clue:`荷札の枠の内側にある印が到着。外にある印は通過。路線札は給水槽の下り側。駅名だけが同じ箱は三つある。`,hints:['同じ名前でも、荷札の枠内と枠外では違う扱い。','路線札の向きと、枠内の給水槽印を照合する。','給水槽・下り・枠内の箱。'],answer:[2,1,0],choices:['枠内','上り','給水槽','枠外'],surface:'wood'},
 {id:'P19',title:'改札鋏の切り口',room:'office',kind:'punchSelect',intro:'三本の鋏。丸い穴に、余分な裂けが一つ。',clue:`試し紙では同じ形の穴が三枚。二枚には毎回同じ向きの裂け。正式な印は輪郭が閉じ、切り残しがない。`,hints:['刃の見た目より、切った紙を比較する。','同じ場所へ繰り返し出る裂けは記号ではない。','中央の鋏だけが、閉じた輪郭を切れる。'],answer:[1],surface:'ticket'},
 {id:'P20',title:'重なった切符',room:'lost',kind:'tickets',intro:'切欠きと、途中駅の印は揃えられる。',clue:`券甲：踏切→塔→給水槽。券乙：塔→給水槽→小屋。券丙：給水槽→塔→踏切。切欠きは同じ端。往復で変わるのは穴の形ではなく、上段と下段。`,hints:['共通する二駅を重ねて比較する。','塔と給水槽は、順番が逆でも同じ形。','甲と乙は一列ずらして重なる。丙は下段に印がある。'],answer:[1,1],surface:'ticket'},
 {id:'P21',title:'トンネル前の標柱',room:'tunnel',kind:'order',intro:'柱の番号だけでは、図の向きは決まらない。',clue:`隧道の口は2番と5番の間。線路は5番から8番へ右に曲がる。給水槽が見えるのは8番を背にした側。`,hints:['番号と、曲線の向きを同時に使う。','給水槽を背に進むと数字は小さくなる。','給水槽側から8 → 5 → 2、そして隧道。'],answer:[2,1,0,3],labels:['2','5','8','隧道'],surface:'paper'},
 {id:'P22',title:'壁の向こうへ灯りを',room:'lamp',kind:'lampAngle',intro:'金具で灯具を固定できる。近い壁が光を遮る。',clue:`高い角度では庇が、低い角度では壁が邪魔する。光を壁の右の隙間へ通すと、二本の線路の合流が見える。`,hints:['光の先だけでなく、途中で遮る物を見る。','高さを中段、向きを右へ。','高さ2、向き4。'],answer:[1,3],surface:'metal'},
 {id:'P23',title:'灯具箱の重り',room:'lamp',kind:'balance',intro:'棒が傾いて、留めが噛み込んでいる。',clue:`左の重りは2、右は3。目盛りは支点からの距離。`,hints:['重さだけでなく、支点からの距離も効く。','軽い方を遠くする。','左を距離3、右を距離2へ。別の釣合いも使える。'],answer:[3,2],surface:'metal'},
 {id:'P24',title:'切符の試し紙',room:'office',kind:'ticketTrial',intro:'形は地点。上下は、どちらへ進んだか。',clue:`切欠きが左の券で、塔から給水槽へは上段。同じ二点を戻る券は下段。表裏を変えても切欠きを基準にする。列は旅の順。試し紙の行先は給水槽から塔。`,hints:['穴の種類と、穴の上下を別々に考える。','戻りでは下段、順番は実際に通る順。','下段へ給水槽、その右へ塔。これは帰りの券そのものではない。'],answer:[2,1],surface:'ticket'},
 {id:'P25',title:'ハンドルの収納',room:'closed',kind:'slide',intro:'二枚の押さえが引出しへ重なる。',clue:`中央の切欠きへ押さえを通すと、一方を退避できる。`,hints:['二つを一度に押す必要はない。','空いた切欠きへ逃がす。','横を中央、縦を下、横を右へ。'],answer:[2,2],surface:'metal'},
 {id:'P26',title:'未使用券の収納',room:'office',kind:'dial',intro:'収納には「返却分」の印。',clue:`管理帳：
発送　青印 4826　白印 1904
返却　青印 7315　白印 2608
箱の裏は青い三日月。文字のかすれた表には発送時の古い印が残る。`,hints:['箱が今使われている用途を確認する。','返却欄と、裏の新しい青印を使う。','7315。'],answer:[7,3,1,5],surface:'wood'},
 {id:'P27',title:'二つの光点',room:'tunnel',kind:'reflection',intro:'水面にも、同じ光が見える。',clue:`遮光板を閉じると手前の石だけ暗くなる。上の光は石の後ろ、下の光は水面。盤の北印は直接光のある側へ向く。`,hints:['光点の明るさでは区別できない。','手前の物への照り返しと、遮られる順番を見る。','上の光が直接光。北印は右上。'],answer:[0,1],surface:'metal'},
 {id:'P28',title:'遮光羽根',room:'closed',kind:'shutters',intro:'二つの停車位置窓へ、同時に光を通したい。',clue:`幅の違う羽根は互いに重なる。中央の窓を隠し、両端の窓だけを照らす。`,hints:['一枚だけでは両端を開けられない。','幅の広い羽根を中央へ、細い羽根をその陰へ。','左の羽根2、右の羽根4。'],answer:[1,3],surface:'metal'},
 {id:'P29',title:'出発欄にない便',room:'office',kind:'schedule',intro:'来た便が、そのまま戻ったとは限らない。',clue:`一便：駅→塔、戻りは通過。
二便：塔→駅、ベルのあと停止。
三便：駅→塔、ベルの前に停止。
記録には「扉閉・通過・ベル・停止」。帰りの乗り場は北。`,hints:['記録の中でベルと停止の前後を確認する。','戻って停止する便は、出発欄では見つからない。','二便、北側。'],answer:[1,1],choices:['一便','二便','三便','南側','北側'],surface:'paper'},
 {id:'P30',title:'進路盤',room:'closed',kind:'route',intro:'途切れた一本が、帰り道につながっている。',clue:`北のホームの線は、駅舎の図から抜けている。給水槽の手前で合流。塔の先に隧道、その先に街の灯。南ホームから出る便は同じ駅へ戻る。`,hints:['出発するホームと、盤の方角を揃える。','接続板とハンドルを取り付け、北側から隧道へ続く経路を作る。','北から開始。板はどちら向きでも、給水槽または小屋→塔→隧道→帰駅へつなげられる。'],answer:[],surface:'route'},
 {id:'P31',title:'列車の去った跡',room:'platform',kind:'traces',intro:'さっきは、車体の陰に隠れていた。',clue:`車窓写真では欠けた近柱の下だけが見えない。今は台車の跡の奥に紙の角がある。`,hints:['新しく現れた物を、以前見えなかった場所と照合する。','欠けた柱の根元、線路側。','中央の柱の下へ鉤を伸ばす。'],answer:[1],surface:'paper'},
 {id:'P32',title:'帰り側の足元',room:'closed',kind:'height',intro:'灯りの下で、段差の違いが見える。',clue:`奥の戸は足場より高い。手前の戸は足場が切れている。中央の戸には同じ高さの踏み板が続く。`,hints:['戸の明るさではなく、足元の連続を確認する。','扉とホームの高さが同じで、踏み板が途切れない位置。','中央。'],answer:[1],surface:'paper'},
 {id:'P33',title:'まだ通っていない区間',room:'waiting',kind:'segments',intro:'使った区間を、もう一度払う必要はない。',clue:`自分の券で使用済み：給水槽、塔。未使用票の範囲：小屋、隧道、帰駅。今作った経路に含まれ、まだ使っていない地点だけを新券へ。`,hints:['全部を逆順に写すのではない。','使用済みの給水槽と塔は、新しい券から除く。','給水槽経由なら隧道・帰駅。小屋経由なら小屋・隧道・帰駅。'],answer:[3,4,5],surface:'ticket'},
 {id:'P34',title:'帰りの切符',room:'waiting',kind:'punch',intro:'紙と鋏がある。帰りの記録を、自分で作れる。',clue:`切欠きから順に、新しく使う区間だけ。切欠きを左にした時、帰り側は下段。便は記録から選ぶ。紙は何枚でも補充できる。`,hints:['経路、使用済み区間、切符の向き、便の四つを照合する。','戻りは下段。使用済みの給水槽と塔は重ねて刻まない。','二便。現在の経路が給水槽経由なら、下段左から隧道・帰駅。小屋経由なら小屋・隧道・帰駅。'],answer:[],surface:'ticket'},
 {id:'P35',title:'今、鳴っている合図',room:'lamp',kind:'signal',intro:'放送のベルには、灯りがついてこない。',clue:`三つの記録：Aは同じ長さで反復、Bは現場の灯と同時、Cは声だけ。運行記録には、現場灯の点灯が発車合図。`,hints:['音の種類より、現場と同時に変わる物を探す。','録音には現場灯との同期がない。','B。'],answer:[1],surface:'wood'},
 {id:'P36',title:'券を通す受け金具',room:'closed',kind:'rings',intro:'二つの細い口が、ずれている。',clue:`紙を折らず、長辺を水平に通す。奥と手前の口を揃える。`,hints:['二つの口の両方を通せる向きにする。','片方だけ揃えても奥でつかえる。','両方を水平に。'],answer:[0,0],surface:'metal'},
 {id:'P37',title:'帰りの列車',room:'closed',kind:'departure',intro:'行先表示は、どの列車も同じだ。',clue:`ベルの後に北側へ停止する二便。前窓には、塔を背にした隧道の入口。録音の反復ではなく、現場灯と同時の合図で進む。`,hints:['表示より、入ってきた方向と停止の合図を確認する。','帰り券と進路が成立していることを先に確認する。','二便・北側・現場灯に同期する合図。'],answer:[1,1,1],surface:'paper'},
 {id:'P38',title:'降りる駅',room:'return',kind:'arrival',intro:'携帯には、帰るはずだった駅の写真が残っている。',clue:`写真：時計の後ろに黄色い自転車置場。時計は七時。今の窓：自転車置場の前を人の影が動き、時計が進む。同じ看板だけの駅は、前後関係が逆。`,hints:['駅名だけでなく、物の前後関係を見る。','止まった写真の再現と、朝が進んでいる場所を区別する。','三つ目の駅。時計の後ろが自転車置場で、生活が動いている。'],answer:[2],surface:'paper'},
];
export const puzzleById=Object.fromEntries(puzzles.map(p=>[p.id,p]));
export interface Hotspot {id:string;x:number;y:number;w:number;h:number;label:string}
export interface Area {name:string;subtitle:string;links:Room[];hotspots:Hotspot[];}
const h=(id:string,x:number,y:number,w:number,h:number,label?:string):Hotspot=>({id,x,y,w,h,label:label??puzzleById[id]?.title??id});
export const areas:Record<Room,Area>={
 train:{name:'到着した車内',subtitle:'雨の音だけが、残っている。',links:['platform'],hotspots:[h('P01',24,0,13,12),h('P02',10,64,20,21),h('P08',87,13,9,25),h('window',9,19,32,32,'車窓'),h('ownTicket',52,86,8,10,'床の切符')]},
 platform:{name:'到着ホーム',subtitle:'来た方向が、分からない。',links:['train','waiting','bridge'],hotspots:[h('P07',42,3,10,16),h('P14',89,70,10,26),h('P15',16,38,15,19),h('P31',52,53,17,25)]},
 waiting:{name:'待合室',subtitle:'窓口の向こうに、誰もいない。',links:['platform','forecourt','office'],hotspots:[h('P04',51,25,27,30),h('P05',52,62,17,20),h('P06',21,31,18,24),h('P33',29,71,19,17),h('P34',69,68,20,20)]},
 forecourt:{name:'駅前',subtitle:'同じ傘が、また見える。',links:['waiting'],hotspots:[h('P13',53,32,27,34),h('loop',4,35,28,55,'駅前の道'),h('wallPhoto',78,20,19,49,'四つの窓')]},
 office:{name:'駅務室',subtitle:'ここでは、時計も違う。',links:['waiting','lost','store'],hotspots:[h('P09',5,34,12,26),h('P11',22,10,13,22),h('P12',37,54,23,22),h('P17',73,28,21,43),h('P19',58,64,15,20),h('P24',18,65,18,24),h('P26',29,79,18,17),h('P29',51,23,17,21)]},
 lost:{name:'忘れ物室',subtitle:'持ち主のいない順番。',links:['office'],hotspots:[h('P10',9,35,32,51),h('P20',56,56,33,26)]},
 bridge:{name:'跨線橋',subtitle:'屋根が、一枚多い。',links:['platform','closed'],hotspots:[h('P16',29,36,52,42)]},
 store:{name:'荷物通路',subtitle:'届けられなかったもの。',links:['office','lamp','tunnel'],hotspots:[h('P18',23,37,39,46)]},
 lamp:{name:'灯具小屋',subtitle:'音と光が、ずれている。',links:['store'],hotspots:[h('P22',67,28,24,28),h('P23',14,57,25,28),h('P35',38,45,22,28)]},
 tunnel:{name:'隧道の側道',subtitle:'水に映る灯が、二つ。',links:['store','closed'],hotspots:[h('P21',58,38,30,36),h('P27',8,31,37,45)]},
 closed:{name:'閉鎖ホーム',subtitle:'帰るための線は、ここにある。',links:['bridge','tunnel','return'],hotspots:[h('P25',8,67,18,23),h('P28',73,32,17,20),h('P30',8,29,30,32),h('P32',55,66,25,22),h('P36',43,49,13,28),h('P37',69,12,27,30)]},
 return:{name:'帰りの車内',subtitle:'窓の外が、少しずつ明るくなる。',links:[],hotspots:[h('P38',16,20,65,48)]},
};


