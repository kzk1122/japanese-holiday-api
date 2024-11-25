import { StatusCodes } from "https://deno.land/x/https_status_codes@v1.2.0/mod.ts";
import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

type HolidayInfo = {
  holidayDate: string;
  holidayName: string;
};

type HolidayInfoResponse = {
  holidays: HolidayInfo[];
}

type ErrorInfo = {
  message: string;
}

// 環境変数からデータベース接続URLを取得
const DATABASE_URL: string = Deno.env.get('SUPABASE_DB_URL')!
// 環境変数から接続プールのサイズを取得
const CONNECTION_POOL_SIZE: number = Number(Deno.env.get('CONNECTION_POOL_SIZE') ?? 3); 

// コネクションプールを作成
const pool:postgres.Pool = new postgres.Pool(DATABASE_URL, CONNECTION_POOL_SIZE, true);

// エラーレスポンスを返却
function buildErrorResponse(message: string, status: number): Response {
  const errorMessage: ErrorInfo = { message };
  return new Response(JSON.stringify(errorMessage), { status });
}

Deno.serve(async (req: Request) => {
  try {
    const { url, method } = req;

    // GET以外のリクエストは拒否
    if (method !== 'GET') {
      return buildErrorResponse('Method Not Allowed.', StatusCodes.METHOD_NOT_ALLOWED);
    }

    // pathparamの取得
    const yearPattern: URLPattern = new URLPattern({ pathname: '/japanese-holiday-api/:year' });
    const matchingPath: URLPatternResult | null = yearPattern.exec(url);
    const year: string | null | undefined = matchingPath ? matchingPath.pathname.groups.year : null;

    // yearが形式通りセットされていない場合はエラー
    if (!year) {
      return buildErrorResponse('Year is not set properly.', StatusCodes.BAD_REQUEST);
    }

    const yearRegex: RegExp = /^\d{4}$/; // YYYY形式
    if (!yearRegex.test(year)) {
      return buildErrorResponse('The year is not in the YYYY format.', StatusCodes.BAD_REQUEST);
    }

    // コネクションプールから接続を取得する
    const connection = await pool.connect();

    try {
      // DBから対象の祝日を取得
      const yearPatternForQuery: string = `${year}%`;
      const query = `SELECT * FROM holidays WHERE holiday_date LIKE $1 ORDER BY holiday_date`;

      const { rows } = await connection.queryArray(query, [yearPatternForQuery]);

      // APIレスポンス作成
      const holidays: HolidayInfo[] = rows.map(row => ({
        holidayDate: String(row[0]),
        holidayName: String(row[1])
      }));
  
      const response: HolidayInfoResponse = {
        holidays
      };

      // レスポンス返却
      return new Response(JSON.stringify(response), {
        status: StatusCodes.OK,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    } finally {
      // コネクションを解放
      connection.release();
    }
  } catch (error) {
    console.error(error);
    return buildErrorResponse(`Internal Server Error.`, StatusCodes.INTERNAL_SERVER_ERROR);
  }
})