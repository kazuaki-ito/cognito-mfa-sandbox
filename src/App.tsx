import React, {useState} from 'react'
import './App.css'
import {Amplify, Auth} from 'aws-amplify'
import awsmobile from '../src/aws-exports'
import QRCode from 'qrcode.react'

Amplify.configure(awsmobile)

function App() {
  const [form, setForm] = useState({
    username: 'dev+03@isoshi-moustache.com',
    password: '00000000',
    isAuthenticated: false,
    challengeName: null,
    qrcodeValue: '',
    code: ''
  })

  /**
   * ログイン処理を行う
   * @param event
   */
  const handleLogin = async (event: any) => {
    // Prevent page reload
    event.preventDefault()

    // await logout()
    try {
      const user = await Auth.signIn(form.username, form.password)
      console.info(user.challengeName)
      switch (user.challengeName) {
        case "SMS_MFA":
        case "SOFTWARE_TOKEN_MFA": {
          const code = prompt("コードを入力してください")
          if (!code) throw new Error('code is empty')
          await Auth.confirmSignIn(user, code, user.challengeName)
          alert("success")
          break
        }
        default: {
          alert("success")
          break
        }
      }
      const authenticatedUser = await Auth.currentAuthenticatedUser()
      console.info(authenticatedUser)

      setForm({
        ...form,
        isAuthenticated: true,
        challengeName: authenticatedUser.preferredMFA
      });

    } catch (e) {
      console.error(e)
      alert("認証失敗")
    }
  }

  const handleChange = (event: any) => {
    // Prevent page reload
    event.preventDefault()
    setForm({...form, [event.target.name]: event.target.value})
  }

  const handleDisabledMFA = async (event: any) => {
    // Prevent page reload
    event.preventDefault()
    try {
      let user = await Auth.currentAuthenticatedUser()
      await Auth.setPreferredMFA(user, 'NOMFA');
      alert('success')
      user = await Auth.currentAuthenticatedUser()
      setForm({
        ...form,
        challengeName: user.preferredMFA
      });
    } catch (e) {
      console.error(e)
      alert("失敗")
    }
  }
  const handleEnabledSMS = async (event: any) => {
    // Prevent page reload
    event.preventDefault()
    try {
      let user = await Auth.currentAuthenticatedUser()
      // 注　）事前に電話番号が登録されていて認証済みになっている必要あり
      await Auth.setPreferredMFA(user, 'SMS');
      alert('success')
      user = await Auth.currentAuthenticatedUser()
      setForm({
        ...form,
        challengeName: user.preferredMFA
      });
    } catch (e) {
      console.error(e)
      alert("失敗")
    }
  }

  const handleSetupTOTP = async (event: any) => {
    // Prevent page reload
    event.preventDefault()
    const user = await Auth.currentAuthenticatedUser()
    const code = await Auth.setupTOTP(user)
    const issuer = encodeURI('AWSCognito')
    const qrcodeValue = "otpauth://totp/AWSCognito:" + user.username + "?secret=" + code + "&issuer=" + issuer
    setForm({...form, qrcodeValue: qrcodeValue})
  }

  const handleEnabledTOTP = async (event: any) => {
    // Prevent page reload
    event.preventDefault()
    console.info(form.code)
    try {
      let user = await Auth.currentAuthenticatedUser()
      await Auth.verifyTotpToken(user, form.code)
      await Auth.setPreferredMFA(user, 'TOTP');
      alert("success")
      user = await Auth.currentAuthenticatedUser()

      setForm({
        ...form,
        qrcodeValue: '',
        challengeName: user.preferredMFA
      });
    } catch (e) {
      console.error(e)
      alert("失敗")
    }
  }


  let component = (
    <div className="form">
      認証サンプル
      <form>
        <div className="input-container">
          <label>Username </label>
          <input type="text" name="username" value={form.username} required onChange={handleChange}/>
        </div>
        <div className="input-container">
          <label>Password </label>
          <input type="password" name="password" value={form.password} required onChange={handleChange}/>
        </div>
        <div className="button-container">
          <input type="submit" onClick={handleLogin} value="ログイン"/>
        </div>
      </form>
    </div>
  )
  if (form.isAuthenticated) {
    component = (
      <div>
        TOTPの有効化
        <div>challengeName: {form.challengeName || 'NOMFA'} </div>
        <input type="submit" onClick={handleDisabledMFA} value="MFAを無効化"/>

        <input type="submit" onClick={handleEnabledSMS} value="MFA(SMS)を有効化"/>

        <input type="submit" onClick={handleSetupTOTP} value="TOTPを設定"/>
      </div>
    )
    if (form.qrcodeValue) {
      component = (
        <div>
          TOTPの有効化
          <div>challengeName: {form.challengeName || 'NOMFA'} </div>
          <div>
            <div>
              <QRCode value={form.qrcodeValue}/>
              <div className="input-container">
                <label>code </label>
                <input type="text" name="code" value={form.code} required onChange={handleChange}/>
              </div>
              <input type="submit" onClick={handleEnabledTOTP} value="TOTPを有効化"/>
            </div>
          </div>
        </div>
      )
    }
  }


  return component
}

export default App
