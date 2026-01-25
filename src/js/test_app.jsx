

const user = {
  name: 'Dirk',
  token: '5d2577e6-8da3-4337-8e08-cb9136a2503e',
};

function MyButton() {
  function handleClick() {
    var resp_data = "leer"
    //alert('You clicked me!');
    axios.get('http://localhost:8090/api/accountgroups/'+user.token)
    .then(response => {
      console.log(response.data);
      alert(response.data.accountGroups[0].aid)
    })



  }

  return (
    <button type="button" id="getAG" onClick={handleClick} class="btn btn-primary me-3">Get Account-Groups</button>
  );
}

function MyForm() {
  const [inputValue, setInputValue] = React.useState('');

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const drpHandleChange = (e) => {
    setSelectedGroup(e.target.value);
    console.log('Selected:', e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Input value:', inputValue);
    axios.get('http://localhost:8090/api/accountgroups/'+inputValue)
    .then(response => {
      console.log(response.data);
      alert(response.data.accountGroups[0].aid)

      return (
      <select value={selectedGroup} onChange={drpHandleChange}>
      <option value="">Select Account Group</option>
      {response.data.accountGroups.map((group) => (
        <option key={group.aid} value={group.aid}>
          {group.accountGroupName}
        </option>
      ))}
    </select>)

    })

  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" class="form-control" id="userInput" v-model="query" name="userInput" placeholder="Bearer Token" value={inputValue} onChange={handleChange} required />
      <br/>
      <button type="submit" id="getAG" class="btn btn-primary me-3">Get Account-Groups</button>
    </form>
  );
}

function App() {
  return (
    <>
      <div class="container py-4 px-3 mx-auto">
      <h1>Hello, {user.name}</h1>
      <p>Ich schreibe JSX in einer externen Datei</p>

      <MyForm />
      </div>

      
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));