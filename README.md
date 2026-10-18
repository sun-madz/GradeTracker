# Grade Tracker

A phone-friendly web app (installable to your home screen) for predicting grades and tracking your CGPA with Taylor's University grading. It syncs with Google Sheets.

## Deploy on Vercel
1. Put this folder in a new GitHub repository (on github.com: **New repository** → **uploading an existing file**, then drag in everything except `node_modules` and `dist`).
2. On vercel.com: **Add New → Project**, then import that repository. Vercel detects Vite on its own, so just click **Deploy**.
3. Open the link on your phone, then use **Share → Add to Home Screen** (iPhone) or **⋮ → Install app** (Android).

Or, from a terminal in this folder: `npm i -g vercel && vercel --prod`

## Link a Google Sheet
1. Create a Google Sheet, then open **Extensions → Apps Script**.
2. Paste in `apps-script/Code.gs` and change `SECRET` to a password of your choice.
3. **Deploy → New deployment → Web app**. Set "Execute as" to **Me** and "Who has access" to **Anyone**, then click **Deploy** and authorise it.
4. In the app's **Settings → Google Sheet**, paste the `/exec` link and type the same password.

Every change syncs about 2 seconds later. The sheet gets three tabs, **Overview**, **Modules** and **Assessments**, plus a hidden `_app_data` tab used for **Restore from Sheet** (for example on a new phone).
If you edit the script later, use **Deploy → Manage deployments → Edit → New version** so the link stays the same.

## Your existing grades
Open the app, tap **Import a backup file**, and choose `my-grades.json` (sent separately — keep it out of GitHub, it has your marks).

## Local development
```
npm install
npm run dev
```

Programme data is in `src/taylors.ts` and the grading scale is in `src/grading.ts`.
