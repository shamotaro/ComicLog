import React from 'react';
import logo from './logo.svg';
import './App.css';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'

//このコンポーネントでは、withAuthenticator コンポーネントを使用
// このコンポーネントは、ユーザー認証フロー全体を足場にして、
// ユーザーがサインアップ、サインイン、パスワードのリセット、
// および多要素認証 (MFA) のサインインの確認を行えるようにします。
// サインアウトボタンをレンダリングする AmplifySignOut コンポーネントも使用

function App() {
  return (
    <div className="App">
      <header>
        <img src={logo} className="App-logo" alt="logo" />
        <h1>We now have Auth!</h1>
      </header>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);