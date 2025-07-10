const app = Vue.createApp({
    data() {
        return {
            message: "ThousandEyes teVis",
            query: ''
        };
    },
  methods: {
    greet() {
      alert(`Test`)
    },
    getAccountGroups() {
      console.log(`Get ThousandEyes Account-Groups`)
      if(this.query != ""){
        fetch(`/api/accountgroups/${encodeURIComponent(this.query)}`)
          .then(response => response.json())
          .then(data => {
            // handle the response data
            if("error" in data){
                alert(data.error_description)
                console.log(data)
            }else{
                console.log(data)
            }
          })
          .catch(error => {
            // handle errors
            console.error(error)
          })
      }else{
        alert("Field can not be empty!")
      }
    }
  }
});

app.mount('#app');
console.log("Vue.js for teVis loaded")