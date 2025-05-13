// v1 格式
const v1result = { 
  "MerchantID": "MS13034418", 
  "Amt": 2487, 
  "TradeNo": "18011115432225613", 
  "MerchantOrderNo": "SB180111154208JIVO33", 
  "RespondType": "JSON", 
  "CheckCode": "8AD3EA0B26E33696C6069F28F7FAA1A2043D88D4828BC71936859495F21934C7", 
  "IP": "1.34.131.143", 
  "EscrowBank": "HNCB", 
  "PaymentType": "CREDIT", 
  "PayTime": "2018-01-11 15:43:22", 
  "RespondCode": "00", 
  "Auth": "930637", 
  "Card6No": "400022", 
  "Card4No": "1111", 
  "Exp": "2004", 
  "TokenUseStatus": 1, 
  "InstFirst": 0, 
  "InstEach": 0, 
  "Inst": 0, 
  "ECI": "" 
};

const v1response = { 
  "Status": "SUCCESS", 
  "Message": "授權成功", 
  "Result": JSON.stringify(v1result) 
};

// v2 格式
const v2result = {
  "MerchantID": "MS3619740261",
  "Amt": 100,
  "TradeNo": "123456789",
  "MerchantOrderNo": "TEST123456",
  "PaymentType": "CREDIT",
  "RespondCode": "00",
  "PayTime": "2025-05-12 10:00:00"
};

const v2response = {
  "Status": "SUCCESS",
  "Message": "付款成功",
  "Result": JSON.stringify(v2result)
};

// 導出
module.exports = {
  v1: {
    result: v1result,
    response: v1response,
    responseBody: { JSONData: JSON.stringify(v1response) }
  },
  v2: {
    result: v2result,
    response: v2response,
    objectFormat: {
      Status: "SUCCESS",
      MerchantID: "MS35492782",
      Version: "2.2",
      TradeInfo: "a756314ef0fc6e19878f339790b5f35bd20b83c8ebe0fbfc52c1840daf58891e07cb3ce914c6d8c65372dfda8274fbe885a819cd4ba6bd34b6e36c720a88e085f77e8a13f7a7b8958bc3df5412ffd073e977fb56ded98e890d513f30784826afc45f7588ffd5d329c417fdb0a8acb2275ce017a61fce2de91667a98bf86655fcf0fba142a00940cb1485e612cd741532b2fcc12d209f7e599c9131a86538f28eae09ed4b57cb9ae722bd39806b7a03b516d94c4ebc5241b5e9afaeb29ba89bf9f49dc96fe3ad0b378b2c430c26782c9505056faa2e94729a350598c27a7de7c5ba1b5aea84415ba07f874adf64e7031769c327ae5ef04c681c00cc51ac983a8347ee7da77300a67f1892277b2df1000c0dbf79ab059915d815f3609255af513bc2a9f8f3e822c5eef3df1a4fac23d120606d1b735004dcac8ed73bad05045d300aa818b00ebdc99b947833c001f66ae54d2c5aae719412aca1478ca35a1748e77fb3f8d07372dc3cd8a3edcdfe30293857a3da1baa49ebf081a729473157fc70",
      TradeSha: "D694AC9F9AA106370ADA175F138EF628E2FADA254D02FB71F79C5F59AF91BF9D"
    },
    decryptedResult: JSON.stringify(v2response)
  }
};