import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

type HolidayInfo = {
  holidayDate: string;
  holidayName: string;
};

type HolidayInfoResponse = {
  holidays: HolidayInfo[];
}

// 環境変数からデータベース接続URLを取得
const databaseUrl = Deno.env.get('SUPABASE_DB_URL')!

// コネクションプールを作成
const pool = new postgres.Pool(databaseUrl, 3, true)

Deno.serve(async (req) => {
  try {

    const { url, method } = req

    // GET以外のリクエストは拒否
    if (method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    // pathparamの取得
    const yearPattern = new URLPattern({ pathname: '/japanese-holiday-api/:year' })
    const matchingPath = yearPattern.exec(url)
    const year = matchingPath ? matchingPath.pathname.groups.year : null

    // yearが形式通りセットされていない場合はエラー
    if (!year) {
      return new Response('Year is not set properly', { status: 400 })
    }

    // Numberに変換できない場合はエラー
    if (isNaN(Number(year))) {
      return new Response('Year is not set properly', { status: 400 })
    }

    // コネクションプールから接続を取得する
    const connection = await pool.connect()

    try {
      // DBから対象の祝日を取得
      const yearPatternForQuery = `${year}%`;
      const query = `SELECT * FROM holidays WHERE holiday_date LIKE $1`;

      const { rows } = await connection.queryArray(query, [yearPatternForQuery]);

      // APIレスポンス作成
      const holidays: HolidayInfo[] = rows.map(row => ({
        holidayDate: row[0],
        holidayName: row[1]
      }));
  
      const response: HolidayInfoResponse = {
        holidays
      };

      // レスポンス返却
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      })
    } finally {
      // コネクションを解放
      connection.release()
    }
  } catch (error) {
    console.error(error)
    return new Response(String(error?.message ?? error), { status: 500 })
  }
})