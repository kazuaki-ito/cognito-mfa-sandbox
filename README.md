#  プロジェクトの起動

```shell
npm install
npm run start
```

## 対応が必要

* SNSの緩和申請 当初　$1/month
* 
https://aws.amazon.com/jp/premiumsupport/knowledge-center/sns-sms-spending-limit-increase/


## memo

### FORCE_CHANGE_PASSWORD => CONFIRMEDに変更するコマンド
```shell
aws cognito-idp admin-set-user-password \
--user-pool-id ${USER_POOL_ID} \
--username ${COGNITO_USERNAME} \
--password ${COGNITO_PASSWORD} \
--permanent
```

### 電話番号を登録するコマンド
```shell
aws cognito-idp admin-update-user-attributes \
--user-pool-id ${USER_POOL_ID} \
--username ${COGNITO_USERNAME} \
--user-attributes Name="phone_number",Value="${PHONE_NUMBER}" Name="phone_number_verified",Value="true" 
```
