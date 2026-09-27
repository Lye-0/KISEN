// Playwright MCP phase bodies. These use visible controls; no saved-state injection.
const shared=String.raw`
const p=page.context().browser().contexts().flatMap(c=>c.pages()).find(p=>p.url().includes('?qa=release'));
if(!p)throw Error('release QA tab missing');
const click=async name=>p.getByRole('button',{name,exact:typeof name==='string'}).click({timeout:8000});
const back=async()=>click('← 戻る');
const go=async room=>{await click('駅の地図');await p.getByRole('dialog',{name:'駅の地図',exact:true}).getByRole('button',{name:new RegExp('^'+room)}).click()};
const dial=async values=>{for(const [i,value] of values.entries()){const n=value>5?value-10:value;for(let k=0;k<Math.abs(n);k++)await click((i+1)+'番の刻印を'+(n<0?'前':'次')+'へ')}};
const range=async(index,value,min=0)=>{const r=p.getByRole('slider').nth(index);await r.focus();await r.press('Home');for(let n=min;n<value;n++)await r.press('ArrowRight')};
const shot=async name=>{await p.locator('.scene-loading,.photo-pending').first().waitFor({state:'hidden',timeout:8000});await p.screenshot({path:'.playwright-mcp/kisen-final-'+name+'.png'})};
`;
const phases=[];
const phase=(name,body)=>phases.push({name,code:`async(page)=>{${shared}\n${body}\nconst errors=await p.evaluate(()=>[...window.__qaErrors,...window.__qaConsole]);if(errors.length)throw Error(JSON.stringify(errors));return {phase:${JSON.stringify(name)},ok:true}}`});
phases.push({name:'00_start',code:String.raw`async(page)=>{
const c=await page.context().browser().newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});const p=await c.newPage();
await p.addInitScript(()=>{window.__qaErrors=[];window.__qaConsole=[];addEventListener('error',e=>window.__qaErrors.push(e.message||'resource:'+(e.target?.src||e.target?.href?.baseVal||e.type)),true);addEventListener('unhandledrejection',e=>window.__qaErrors.push(String(e.reason)));const original=console.error;console.error=(...args)=>{window.__qaConsole.push(args.map(String).join(' '));original(...args)}});
await p.goto('http://127.0.0.1:4205/?qa=release');await p.locator('.title-photo').evaluate(e=>e.decode());await p.screenshot({path:'.playwright-mcp/kisen-final-title.png'});await p.getByRole('button',{name:/扉の向こうへ/}).click();return {phase:'00_start',ok:true}}
`});
phase('01_train_items',String.raw`
await click('荷物棚の箱');await click('横の爪を右へ');await click('縦の爪を下へ');await click('縦の爪を下へ');await click('横の爪を右へ');await click('ふたを開ける');await shot('box-open');await click('箱の中の小鍵を取る');await back();
await click('座席の鞄');await click('1番の鞄の輪を回す');for(let i=0;i<3;i++)await click('2番の鞄の輪を回す');await click('留め具を外す');await click('鞄の写真を取る');await back();await click('床の切符');await p.getByRole('dialog',{name:'観察の記録'}).getByRole('button',{name:'閉じる ×',exact:true}).click();
`);
phase('02_photos_and_case',String.raw`
await click('車窓');await click('3枚目を大きく見る');await click('この写真を前へ');await click('この写真を前へ');await click('5枚目を大きく見る');for(let i=0;i<3;i++)await click('この写真を前へ');await click('5枚目を大きく見る');await click('この写真を前へ');await click('今の配置を記録する');await shot('photo-order');await back();
await click('車内の路線ケース');for(const [i,n] of [0,1,3,2,0].entries())for(let j=0;j<n;j++)await click((i+1)+'番の沿線印を回す');await click('ケースを開ける');await click('ケースの駅務室の鍵を取る');await back();await shot('train-collected');await click('↑ 到着ホーム');
`);
phase('03_clock',String.raw`
await click('ホームの時計');await click('内側を回す');if(!await p.locator('.inspection-status').innerText().then(t=>t.includes('外側')))throw Error('clock collision feedback missing');for(let i=0;i<2;i++)await click('外側を回す');for(let i=0;i<3;i++)await click('内側を回す');for(let i=0;i<2;i++)await click('外側を回す');await click('巻き軸を回す');await back();await click('↑ 待合室');await shot('waiting-initial');
`);
phase('04_grille',String.raw`
await click('窓口の格子');await click('下の横棒');await click('→');await click('上の横棒');for(let i=0;i<3;i++)await click('→');await click('引き手');for(let i=0;i<4;i++)await click('→');for(let i=0;i<4;i++)await click('↑');for(let i=0;i<2;i++)await click('→');await click('格子を引く');await back();await click('案内図の裏');await click('裏返す');await click('灯りにかざす');await click('図の間に挟まれた紙を持つ');await click('今の配置を記録する');await back();
`);
phase('05_waiting_and_forecourt',String.raw`
await click('窓口の引出し');await dial([2,1,3,6]);await click('引出しを引く');await click('記録機のつまみを取り出す');await back();await shot('waiting-open');await click('↓ 駅前');await click('四つの窓');await p.getByRole('dialog',{name:'観察の記録'}).getByRole('button',{name:'閉じる ×',exact:true}).click();await click('貼り替えられた掲示');await click(/丙$/);await click(/甲$/);await click('今の配置を記録する');await shot('notices');await back();await click('駅前の道');await shot('loop-road');await click('道の先へ');await click('↑ 待合室');await click('↑ 駅務室');
`);
phase('06_hook_and_clocks',String.raw`
await click('工具掛け');for(const n of ['↓','↓','→','→','↑','→','→'])await click(n);await click('輪を抜く');await click('鉤付きの棒を取り出す');await back();await click('二つの時計');await click('同時撮影の記録を見る');await shot('clock-evidence');await p.locator('.evidence-sheet').getByRole('button',{name:'閉じる ×',exact:true}).click();const sections=p.locator('.clock-comparison>section');for(let i=0;i<3;i++)await sections.nth(0).getByRole('button',{name:'1番の刻印を前へ',exact:true}).click();for(let i=0;i<2;i++)await sections.nth(1).getByRole('button',{name:'1番の刻印を次へ',exact:true}).click();await click('今の配置を記録する');await back();
`);
phase('07_recording',String.raw`
await click('放送の記録機');await click('つまみを付ける');for(let i=0;i<4;i++)await click('Bの記録を右へ');for(const [i,n] of [[2,1],[3,2],[4,3]])for(let j=0;j<n;j++)await click(new RegExp('^'+i+'番の出来事'));await shot('recording');await click('保管棚を開ける');await click('路線札を取り出す');await click('記録機の銘板を見る');await click('記録に残す');await p.locator('.evidence-sheet').getByRole('button',{name:'閉じる ×',exact:true}).click();await back();
`);
phase('08_punch_and_stock',String.raw`
await click('改札鋏の切り口');await click('左の鋏');await click('この鋏を外す');if(!await p.locator('.inspection-status').innerText().then(t=>t.includes('裂け')))throw Error('bad punch should be rejected');await click('中央の鋏');await click('この鋏を外す');await click('改札鋏を取り出す');await back();await click('未使用券の収納');await dial([7,3,1,5]);await click('引出しを開ける');await click('乗車券用紙を取り出す');await back();await shot('office-collected');
`);
phase('09_ticket_trial_and_schedule',String.raw`
await click('切符の試し紙');await click('丁');await shot('ticket-example-d');await click('丸の試し鋏');await click('1列 下段に穴を開ける');await click('三角の試し鋏');await click('2列 下段に穴を開ける');await click('今の配置を記録する');await back();await click('出発欄にない便');await click('二便');await click('北側');await shot('schedule');await click('今の配置を記録する');await back();await click('↑ 忘れ物室');
`);
phase('10_lost_property',String.raw`
await click('忘れ物の傘');for(const name of ['1枚目、赤','3枚目、青','2枚目、黒','3枚目、赤','3枚目、黒','4枚目、透明'])await click(name);await click('受取棚を引く');await click('重い管理札を取り出す');await back();await click('重なった切符');await click('重ねた券を右へ');await click('今の配置を記録する');await shot('ticket-overlay');await back();await shot('lost-collected');await go('到着ホーム');
`);
phase('11_reach_and_gate',String.raw`
await click('手すりの向こう');await range(0,2);await range(1,3);await click(/鉤を返す/);await click('鉤を引き寄せる');await click('解除片を取り出す');await back();await click('↑ 跨線橋');await click('横の爪を右へ');await click('縦の爪を下へ');await click('縦の爪を下へ');await click('横の爪を右へ');await click('柵を開ける');await click('短い金具を取り出す');await back();await click('↑ 跨線橋');
`);
phase('12_hidden_corridor_and_handle',String.raw`
await click('駅の見取り図');for(const name of ['4列、3段の区画','4列、2段の区画','4列、1段の区画','3列、1段の区画'])await click(name);await shot('hidden-corridor');await click('通路を確かめる');await back();await click('↑ 閉鎖ホーム');await click('ハンドルの収納');await click('左の押さえを動かす');await click('受け金具を回して差す');await click('右の押さえを動かす');await click('受け金具を回して差す');await click('収納を引く');await click('進路のハンドルを取り出す');await back();await go('駅務室');
`);
phase('13_cargo',String.raw`
await click('↑ 荷物通路');await click('1番の箱を選ぶ');await click('↓');await click('↓');await click('3番の箱を選ぶ');await click('↓');await click('台車を選ぶ');for(let i=0;i<4;i++)await click('→');await shot('cargo');await click('台車を出口へ押す');await back();await click('↑ 荷物通路');await click('荷札の違い');await dial([6,2,8,4]);await click('荷物箱を開ける');await click('接続板を取り出す');await back();
`);
phase('14_lamp_door_and_balance',String.raw`
await click('↑ 灯具小屋');await dial([4,7,0,6]);await click('戸の取っ手を引く');await click('灯具箱の重り');await click('重い管理札');await range(0,3,1);await range(1,2,1);await shot('balance');await click('留めを抜く');await click('交換灯具を取り出す');await back();
`);
phase('15_light_and_signal_study',String.raw`
await click('壁の向こうへ灯りを');await click('金具を取り付ける');await range(0,1);await range(1,3);await shot('light-path');await click('照らした札を記録する');await back();await click('今、鳴っている合図');await click('記録Bを選ぶ');await click('今の配置を記録する');await back();await shot('lamp-collected');await click('‹ 荷物通路');await click('↑ トンネルの側道');
`);
phase('16_tunnel_and_route',String.raw`
await click('トンネル前の標柱');await click('1枚目、2');await click('3枚目、8');await click('今の配置を記録する');await back();await click('二つの光点');await click('手元の灯具を開く');await click('今の配置を記録する');await shot('tunnel-light');await back();await click('↑ 閉鎖ホーム');await click('進路盤');await click('接続板を取り付ける');await click('ハンドルを取り付ける');await click('出発側を切り替える');await click('接続板を裏返す');await click('分岐ハを切り替える');await click('分岐ハを切り替える');await click('分岐ホを切り替える');await click('進路を走査する');await click('盤を記録する');await shot('route');await back();
`);
phase('17_trace_and_revisit',String.raw`
await go('到着ホーム');await shot('platform-shifted');await click('列車の去った跡');await click('線路際の紙へ鉤を伸ばす');await click('紙を引き寄せる');await click('区間の控えを取り出す');await back();await click('↑ 留置線の車内');await shot('train-stabled');await click('↑ 到着ホーム');await go('待合室');await click('まだ通っていない区間');await click(/^トンネル/);await click(/^白沢/);await click('今の配置を記録する');await shot('unused-segments');await back();await click('帰りの切符');
`);
phase('18_ticket',String.raw`
await click('アーチの鋏');await click('1列 下段に穴を開ける');await click('ひし形の鋏');await click('2列 下段に穴を開ける');await click('2');await click('切符を持つ');await shot('ticket');await back();await go('閉鎖ホーム');await click('券を通す受け金具');for(let i=0;i<3;i++)await click('手前の受け口を回す');await click('奥の受け口を回す');await click('券を通す');await shot('ticket-mounted');await back();
`);
phase('19_shutters_and_train',String.raw`
await click('遮光羽根');await click('灯具を取り付ける');await click('薄い見取り図');await range(0,2);await range(1,1);await shot('signal-ready');await back();await click('呼出機');await click('2');await click('この便を呼ぶ');await back();await shot('train-arrived');await click('帰り側の足元');await click('中央の踏板');await click('この足場へ進む');await click('左の合図を選ぶ');await click('この列車へ乗る');await shot('return-car');
`);
phase('20_arrival',String.raw`
await click('降りる駅');await click('この駅を見送る');await click('この駅を見送る');await click('しばらく眺める');await shot('arrival');await click('扉を開けて降りる');await p.locator('.ending-screen>img').evaluate(e=>e.decode());await shot('ending');if(!await p.getByText('扉の外に、朝があった。',{exact:true}).isVisible())throw Error('ending not reached');
`);
export default phases;
