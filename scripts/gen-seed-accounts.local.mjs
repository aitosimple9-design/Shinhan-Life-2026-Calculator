// Sinh SQL tạo 26 tài khoản TEST. Chạy: node scripts/gen-seed-accounts.local.mjs
// Mật khẩu mặc định = ddmmyy (ngày sinh) + 4 số cuối CCCD, tính TRONG SQL rồi băm bcrypt — không ghi mật khẩu dạng rõ ra file nào.
// Cờ must_change_password giữ mặc định true. File này và .sql đầu ra khớp *.local.* nên không vào git.
// XÓA file này sau khi seed xong (chứa CCCD đầy đủ).
import fs from 'node:fs';

// tên | mã số | chức danh | ngày sinh dd/mm/yyyy | CCCD 12 số
const RAW = `HOÀNG QUỐC TÍN|60004214|SM|30/10/1983|060083010583
TRẦN NGỌC HOÀNG NI|60004217|ESL|08/04/1987|095187001975
LÊ HƯƠNG THU|60005346|GSL|15/05/1983|048183006299
LÂM THỦY TỐ LAN|60004226|GSL|06/08/1977|082177016921
LÊ ANH THƯ|60004215|GSL|12/07/1994|079194006853
VÕ THỊ BÚP|60004216|GSL|10/03/1990|052190021763
NGUYỄN THỊ MINH THƯ|60005650|FC|10/10/2004|089304005414
LÊ THỊ BÍCH HÀ|60005361|FC|27/06/1993|067193004443
TRỊNH THỤY PHƯƠNG UYÊN|60005350|FC|13/08/1983|079183028301
ĐẶNG TRƯỜNG GIANG|60005311|FC|20/08/1991|083091008553
NGUYỄN HỮU ĐỨC|60005302|FC|22/07/1990|024090009295
KIỀU NGỌC HÒA|60005301|FC|30/03/1995|079095037922
LÊ THỊ NGỌC HÂN|60005237|FC|19/04/1966|079166031184
NGUYỄN THỊ KIM OANH|60005127|FC|19/04/1993|052193008898
NGUYỄN THỊ MINH CHÂU|60005117|FC|11/07/1983|049183000112
ĐẶNG THỊ THU THỦY|60005056|FC|10/05/1972|086172012744
LÊ THỊ ĐĂNG TUYỀN|60005053|FC|30/01/1989|083189004339
LÊ THỊ BÌNH|60004717|FC|20/01/1968|079168014564
LÊ THỊ LÂM BIỂN|60004649|FC|25/05/1978|079178019465
VŨ THỊ TUẤN ANH|60004594|FC|25/05/1982|075182000423
VÕ KIM CƯƠNG|60004595|FC|20/05/1983|083183000116
LÊ MINH|60004596|FC|16/02/1998|084098009525
TRẦN THỊ NGUYỆT|60004597|FC|11/11/1967|079167023528
NGUYỄN HỒ THỦY VI|60004466|FC|07/02/1990|079190004360
NGUYỄN VĂN LỘC|60004230|FC|02/06/1999|087099001779
DƯƠNG NGUYỄN TUYẾT THẢO|60004219|FC|09/01/1999|082199012324`;

const rows = RAW.split('\n').map((line) => {
  const [name, code, role, dob, cccd] = line.split('|');
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dob) || !/^\d{12}$/.test(cccd)) throw new Error(`Dữ liệu sai ở dòng: ${name}`);
  return { name, code, role, dob, cccd };
});
if (rows.length !== 26) throw new Error(`Cần đúng 26 dòng, đang có ${rows.length}`);

const values = rows.map((r) => `('${r.code}','${r.role}','${r.name}','${r.dob}','${r.cccd}')`).join(',\n');
const sql = `do $$
declare r record; uid uuid;
begin
  for r in select * from (values
${values}
  ) as t(code, role, name, dob, cccd) loop
    uid := gen_random_uuid();
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change,email_change_token_new)
    values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','emp'||r.code||'@shinhanlife.internal',crypt(substr(r.dob,1,2)||substr(r.dob,4,2)||substr(r.dob,9,2)||right(r.cccd,4),gen_salt('bf',10)),now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','');
    insert into auth.identities (id,user_id,provider_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
    values (gen_random_uuid(),uid,uid::text,jsonb_build_object('sub',uid::text,'email','emp'||r.code||'@shinhanlife.internal','email_verified',true),'email',now(),now(),now());
    insert into public.profiles (id,employee_code,role,display_name,birth_date,national_id) values (uid,r.code,r.role,r.name,r.dob,r.cccd);
  end loop;
end $$;`;

fs.writeFileSync('scripts/seed-accounts.local.sql', sql);
console.log(`OK: ${rows.length} tài khoản -> scripts/seed-accounts.local.sql`);
