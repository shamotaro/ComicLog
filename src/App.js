import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' }

//このコンポーネントでは、withAuthenticator コンポーネントを使用
// このコンポーネントは、ユーザー認証フロー全体を足場にして、
// ユーザーがサインアップ、サインイン、パスワードのリセット、
// および多要素認証 (MFA) のサインインの確認を行えるようにします。
// サインアウトボタンをレンダリングする AmplifySignOut コンポーネントも使用

// APIでユーザーがメモを作成、一覧表示、削除できるようにする
// fetchNotes - この関数は、API クラスを使用してクエリを GraphQL API に送信し、メモのリストを取得します。
// createNote - この関数はまた、API クラスを使用して変異を GraphQL API に送信します。
// 主な違いは、この関数では、GraphQL 変異に必要な変数を渡して、フォームデータで新しいノートを作成できることです。
// deleteNote - createNote と同様に、この関数は変数と共に GraphQL ミューテーションを送信しますが、メモを作成する代わりにメモを削除します。

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
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
      <button onClick={createNote}>Create Note</button>
      <div style={{marginBottom: 30}}>
        {
          notes.map(note => (
            <div key={note.id || note.name}>
              <h2>{note.name}</h2>
              <p>{note.description}</p>
              <button onClick={() => deleteNote(note)}>Delete note</button>
            </div>
          ))
        }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);