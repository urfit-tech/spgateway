const logger = require("../lib/logger");
const log = logger.createLog("PeriodicalService");

const ValidationHelper = require("../lib/validation.helper");
const payFormGenerator = require("../lib/payform.generator");

const SHA256 = require("../lib/sha256");
const ASE256 = require("../lib/aes256");
const querystring = require("querystring");

const modelPivot = require("../model/model.pivot");
const MpgPayModel = modelPivot.MPG.MpgPayModel;
const MpgNotifyModel = modelPivot.MPG.MpgNotifyModel;

const spApiVersion = "2.2";

class MpgService {
  /**
   *
   * @param {Configuration} config
   */
  constructor(config) {
    this.config = config;
    this.apiUrl = `https://${config.host}/MPG/mpg_gateway`;
    this.validationHelper = new ValidationHelper(config);
  }

  /**
   *
   * @returns {MpgPayModel}
   */
  createMpgPayModel() {
    return new MpgPayModel();
  }

  /**
   * 付款 html form
   * @returns {string}
   */
  getAutoPayForm(payModel) {
    let model = new MpgPayModel();
    model = Object.assign(model, payModel);
    model.Version = model.Version || spApiVersion;
    model.MerchantID = this.config.MerchantID;



    if (model.Version === "1.1") {
      const shaEncrypt = new SHA256();
      model.TokenTerm = shaEncrypt.encrypt(model.Email).toUpperCase();
      model.CheckValue = this.validationHelper.genMpgCheckValue(
        model.Amt,
        model.MerchantOrderNo,
        model.TimeStamp,
        model.Version
      );
      
      log.debug("payModel V1.1", payModel);
      let html = payFormGenerator(model, this.apiUrl);
      log.debug("payFormHtml V1.1", html);
      return html;
    } else {
      const aseEncrypt = new ASE256(this.config.HashKey, this.config.HashIV);
      model.TradeInfo = aseEncrypt.encrypt(querystring.stringify(model));

      const shaEncrypt = new SHA256(this.config.HashKey, this.config.HashIV);
      model.TradeSha = shaEncrypt.encryptWithKeyIv(model.TradeInfo).toUpperCase();

      log.debug("payModel V2.2", payModel);
      let html = payFormGenerator(
        {
          MerchantID: model.MerchantID,
          Version: model.Version,
          TradeInfo: model.TradeInfo,
          TradeSha: model.TradeSha,
        },
        this.apiUrl
      );
      log.debug("payFormHtml V2.2", html);
      return html;
    }
  }

  /**
   * 付款 form data
   * @returns {string}
   */
  getAutoPayData(payModel) {
    let model = new MpgPayModel();
    model = Object.assign(model, payModel);
    model.Version = model.Version || spApiVersion;
    model.MerchantID = this.config.MerchantID;

    const shaEncrypt = new SHA256(this.config.HashKey, this.config.HashIV);
    model.TokenTerm = shaEncrypt.encrypt(model.Email).toUpperCase();
    model.CheckValue = this.validationHelper.genMpgCheckValue(
      model.Amt,
      model.MerchantOrderNo,
      model.TimeStamp,
      model.Version
    );
    log.debug("payModel", payModel);
    return model;
  }

  /**
   *
   * @param {string} jsonString
   * @returns {Promise<MpgNotifyModel>}
   * VACC: {"Status":"SUCCESS","MerchantID":"MS35492782","Version":"2.2","TradeInfo":"e012819a6bed3153b31a8683a477fae3008ccba7e315e693bc58f0699d7f3b20575086b96f9cbeb1c6bbf97fb2a7cd484342fa1b4304c3eee56dff318c9a9c26faf66a2b58a95b0996bd822cc475ade16259fdb63395d1b0114c22a49f8da67d10b6a9f99fdca58c86b2c1d1de812e5de657072401dccf1ebf2a6981f2e67483fa4999bb578f5b5adc156043fac16b4ee97188dea6e53f39fbe878a0e2ebfe884402a1875e21a6d4aee48bdaa6b865d5a52f0ecb77eaf1aa4395593733a7bcd11b28ddf28b6fcc30a0434fbbdd185113a26fd34492efffe4fae9fa5ad21b6f205f4bddd0bc5550028b2e467acba2dd87bab37cc50f8f2311b4733e3db1ac2a0453daff58aaedb735cb58cf96eaf5f3ab05dd48c97250608217ea0820ecc04ee6e1178fef3c18ba952460bc997dc7f3ce8f71bb0964eee4558ac30d40a4c217672cd047b19d90d198986b84a424554f7501df359b27b46b7c1868ecbbf4a76582c1c9a7670ef01253c44ecd9e62f73b3b5e72c4b1179983d5fde5fa7029654768e828a0c1869a92523e9a5277ec8c2a2cc80421ff643df1a89819176268db6a492fa8cc431734ac67d749729c2ccb33869ab44e924f6bd6e658268d6ea6e400f87b950dbd0836fd36935c5852da6c485abd2a04ad1ad366ef0cff299bb33c2e29ba8a052d009d7877efb0abdae0058238b6b66c7e482d81a16ea061261090e94ba12a59d57ff3f19b25d3890d84ce938deac46c37958c920764cae4696233c8991cd73414a4ac28a6ef2d5cb4e0a289b5acd80e8a44117277411b7f1c4695c006","TradeSha":"BC0F353128A18C8A7B8327892C8D4728242E147EA18C142C305CCE995B99E2E8"}
   */
  parseNotification(data) {
    if (data && typeof data === "object" && data.TradeInfo) {
      try {
        const aseEncrypt = new ASE256(this.config.HashKey, this.config.HashIV);
        const result = aseEncrypt.decrypt(data.TradeInfo);
        return JSON.parse(result);
      } catch (error) {
        throw new Error(
          `v2.2解析失敗 [MID:${data.MerchantID || "Unknown"}]: ${
            error.message
          }, 資料: ${JSON.stringify(data)}`
        );
      }
    }

    if (data && typeof data === "object" && data.JSONData) {
      let originalData = data;
      let resultModel;
      try {
        data = data.JSONData;
        const model = JSON.parse(data || "{}");
        model.Result = JSON.parse(model.Result || "{}");
        resultModel = model.Result;

        const checkCode = this.validationHelper.genMpgCheckCode(
          resultModel.Amt,
          resultModel.MerchantOrderNo,
          resultModel.TradeNo
        );

        if (checkCode !== resultModel.CheckCode) {
          throw new Error(
            `CheckCode驗證失敗, 計算: ${checkCode}, 接收: ${resultModel.CheckCode}`
          );
        }

        return model;
      } catch (error) {
        const mid = resultModel
          ? resultModel.MerchantID || "Unknown"
          : "Unknown";
        throw new Error(
          `v1.1解析失敗 [MID:${mid}]: ${error.message}, 資料: ${JSON.stringify(
            originalData
          )}`
        );
      }
    }
  }

  /**
   * @returns {modelPivot.MPG}
   */
  get Models() {
    return modelPivot.MPG;
  }
}

module.exports = MpgService;
