const { execSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const captures = [
  { url: 'http://localhost:3000/signup?theme=light', out: 'public/screenshots/registration/register_default_light.png' },
  { url: 'http://localhost:3000/signup?theme=dark', out: 'public/screenshots/registration/register_default_dark.png' },
  { url: 'http://localhost:3000/signup?theme=light&error=1&email=user@gmail.com', out: 'public/screenshots/registration/register_error_light.png' },
  { url: 'http://localhost:3000/signup?theme=dark&error=1&email=user@gmail.com', out: 'public/screenshots/registration/register_error_dark.png' },
  { url: 'http://localhost:3000/signup?theme=light&role=student&name=Prachi%20Sharma&email=prachi.z24bca@shantibschool.edu.in', out: 'public/screenshots/registration/register_student_light.png' },
  { url: 'http://localhost:3000/signup?theme=dark&role=student&name=Prachi%20Sharma&email=prachi.z24bca@shantibschool.edu.in', out: 'public/screenshots/registration/register_student_dark.png' },
  { url: 'http://localhost:3000/signup?theme=light&role=faculty&name=Prof.%20Arthur%20Miller&email=prof.miller@shantibschool.edu.in', out: 'public/screenshots/registration/register_faculty_light.png' },
  { url: 'http://localhost:3000/signup?theme=dark&role=faculty&name=Prof.%20Arthur%20Miller&email=prof.miller@shantibschool.edu.in', out: 'public/screenshots/registration/register_faculty_dark.png' }
];

for (const cap of captures) {
  const fullOut = path.resolve(cap.out);
  console.log(`Capturing: ${cap.out}`);
  const cmd = `"${chromePath}" --headless=new --disable-gpu --window-size=1200,1050 --screenshot="${fullOut}" "${cap.url}"`;
  execSync(cmd);
}
console.log('All 8 screenshots successfully captured!');
