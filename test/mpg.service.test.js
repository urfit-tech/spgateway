const assert = require("assert");

const spgateway = require("./spgateway.provider");

const mpgRes = require("./resource/mpg.creditcard");

describe("mpg service", function () {
    const mpgService = spgateway.createMpgService();

    describe("mpg checkValue", function () {
        it("should be the same", function () {
            let payModel = mpgService.createMpgPayModel();
            payModel.MerchantOrderNo = "1515501989";
            payModel.TimeStamp = "1515501989";
            payModel.Amt = 81;

            let checkValue = mpgService.validationHelper.genMpgCheckValue(payModel.Amt,
                payModel.MerchantOrderNo,
                payModel.TimeStamp,
                payModel.Version);

            let expected = "18B9A57C8429F4F1624CC141F3F5F6CBCF09384ED0F910A2EE3871791F349943";

            assert.equal(checkValue, expected);
        });


    });


    describe("mpg parse notification", function () {
        it("sshould parse v1.1 format correctly", function (done) {
            const responseBody = mpgRes.v1.responseBody;
            try {
                const notify = mpgService.parseNotification(responseBody)

                assert.equal(notify.Status, "SUCCESS");

                done();
            } catch (err) {
                done(err);
            }
        });

    });

    describe("mpg parse notification v2.2", function () {
        it("should parse v2.2 format correctly", function (done) {
            const v2Data = mpgRes.v2.objectFormat;

            try {
                const notify = mpgService.parseNotification(v2Data);

                assert.equal(notify.Status, "SUCCESS");

                done();
            } catch (err) {
                done(err);
            }
        });
    });

});