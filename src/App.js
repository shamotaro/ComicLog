// Reactをインポート、React hooksを利用(クラスのソースを書かずに基本的な機能を利用できる)
import React, { useState, useEffect } from 'react';
import './App.css';
import Table from './table';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
// GraphQL は API のために作られたクエリ言語であり、既存のデータに対するクエリを実行するランタイム
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';

// 入力フォームにデフォルト(最初)で入れておく値
const initialFormState = { name: '', description: '' }

//このコンポーネントでは、withAuthenticator コンポーネントを使用
// このコンポーネントは、ユーザー認証フロー全体を足場にして、
// ユーザーがサインアップ、サインイン、パスワードのリセット、
// および多要素認証 (MFA) のサインインの確認を行えるようにします。
// サインアウトボタンをレンダリングする AmplifySignOut コンポーネントも使用

// APIでユーザーがメモを作成、一覧表示、削除できるようにする
function App() {

   // notesはただの変数
   // setNotesはnotesに値を入れるためだけの関数
   // useState([])の[]はnotesの初期値
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const style = {
    width: "50%",
    margin: "0 auto",
    marginTop: 150,
  };

  // 第1引数には実行させたい副作用関数を記述
  // 第2引数には副作用関数の実行タイミングを制御する依存データを記述
  useEffect(() => {
    fetchNotes();
  }, []);

  // API クラスを使用してクエリを GraphQL API に送信し、メモのリストを取得
  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    setNotes(apiData.data.listNotes.items);
  }

  // API クラスを使用して変異を GraphQL API に送信
  // この関数では、GraphQL 変異に必要な変数を渡して、フォームデータで新しいノートを作成できる
  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    // 画像がメモに関連付けられている場合は、画像をローカル画像配列に追加
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  // createNoteと同様に変数と共に GraphQLミューテーションを送信しますが、メモを作成する代わりにメモを削除
  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }

  // 画像のアップロードを処理
  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchNotes();
  }

  // メモに関連付けられている画像を取得
  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      if (note.image) {
        const image = await Storage.get(note.image);
        note.image = image;
      }
      return note;
    }))
    setNotes(apiData.data.listNotes.items);
  }



  return (
    <div className="App">
      <h1>My Notes App</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Note name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Note description"
        value={formData.description}
      />
      <input
        type="file"
        onChange={onChange}
      />
      <button onClick={createNote}>Create Note</button>


      <div style={{marginBottom: 30}}>
        {
          notes.map(note => (
            <div key={note.id || note.name}>
              <h2>{note.name}</h2>
              <p>{note.description}</p>
              <button onClick={() => deleteNote(note)}>Delete note</button>
              {
                note.image && <img src={note.image} style={{width: 400}} />
              }
            </div>
          ))
        }
      </div>

      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);