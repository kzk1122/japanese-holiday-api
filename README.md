# japanese-holiday-api
日本の祝日を取得するAPI

祝日データについては[内閣府ホームページ記載](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html)の
[昭和30年（1955年）から令和7年（2025年）国民の祝日（csv形式：20KB）](https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv)を元に作成。  
1955年から2024年までの祝日データを年単位（YYYY形式）で取得できます。  
銀行休業日は含まれません。  
振替休日がある場合は振替休日も合わせて返却します。  

例）：2024年の祝日の一覧取得
サンプル用URL
https://gsscqnnnbuymbvdzaawj.supabase.co/functions/v1/japanese-holiday-api/2024

レスポンス

```
{
  "holidays": [
    {
      "holidayDate": "20240101",
      "holidayName": "元日"
    },
    {
      "holidayDate": "20240108",
      "holidayName": "成人の日"
    },
    {
      "holidayDate": "20240211",
      "holidayName": "建国記念の日"
    },
    {
      "holidayDate": "20240212",
      "holidayName": "振替休日"
    },
    {
      "holidayDate": "20240223",
      "holidayName": "天皇誕生日"
    },
    {
      "holidayDate": "20240320",
      "holidayName": "春分の日"
    },
    {
      "holidayDate": "20240429",
      "holidayName": "昭和の日"
    },
    {
      "holidayDate": "20240503",
      "holidayName": "憲法記念日"
    },
    {
      "holidayDate": "20240504",
      "holidayName": "みどりの日"
    },
    {
      "holidayDate": "20240505",
      "holidayName": "こどもの日"
    },
    {
      "holidayDate": "20240506",
      "holidayName": "振替休日"
    },
    {
      "holidayDate": "20240715",
      "holidayName": "海の日"
    },
    {
      "holidayDate": "20240811",
      "holidayName": "山の日"
    },
    {
      "holidayDate": "20240812",
      "holidayName": "振替休日"
    },
    {
      "holidayDate": "20240916",
      "holidayName": "敬老の日"
    },
    {
      "holidayDate": "20240922",
      "holidayName": "秋分の日"
    },
    {
      "holidayDate": "20240923",
      "holidayName": "振替休日"
    },
    {
      "holidayDate": "20241014",
      "holidayName": "スポーツの日"
    },
    {
      "holidayDate": "20241103",
      "holidayName": "文化の日"
    },
    {
      "holidayDate": "20241104",
      "holidayName": "振替休日"
    },
    {
      "holidayDate": "20241123",
      "holidayName": "勤労感謝の日"
    }
  ]
}

```

## システム構成図

### 概要
SupabaseのEdge FunctionとDatabaseを使用。  
クライアントからの受付をEdge Functionで行い、祝日データの取得はDatabaseから行う。  

![japanese-holiday-api drawio](https://github.com/user-attachments/assets/fd024ce7-a2a4-4599-bfcb-725a670d942d)