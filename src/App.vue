<template>
  <div id="app" data-app>
    <div>
        <v-btn
          outlined
          color="primary"
          class="background-white"
          @click="handleChoseFile"
          >Chọn ảnh</v-btn
        >
        <input
          hidden
          ref="uploader"
          class="d-none"
          type="file"
          accept=".png"
          multiple
          v-on:change="changeFile"
        />
        <CropperImg :value="showDialog" @input="showDialog = $event" @handleSaveImg="handleSaveImg" :arrayImg="arrayImg"  />
  </div>
</div>  
</template>

<script>
import CropperImg from './components/CropperImg.vue';
export default {
  name: 'App',
  components:{
    CropperImg
  },
  data(){
    return {
      arrayImg: [] ,
      showDialog:false ,
    }
  } ,
  methods : {
    async handleSaveImg(data) {
      this.showDialog = false ;
       for(let i = 0 ; i <= data?.length - 1 ; i++){ 
        this.desserts.push({
            id: data[i].id,
            is_answer: false,
            error : false,
            message : '',
            commentary: "",
            commentary_title: "",
            file_url: data[i].url,
            file: data[i].file,
            file_name: data[i].fileName,
          });
         }
    },
    handleChoseFile() {
      this.$refs.uploader.value = "";
      this.$refs.uploader.click();
    },
    async changeFile(e) {
      const files = e.target.files;
      this.arrayImg = [];
      for (let i = 0; i < files.length; i++) {
          const objectUrl = URL.createObjectURL(files[i]);
          this.arrayImg.push({
            id: Date.now()+i,
            fileName: files[i].name,
            url: objectUrl,
            type : files[i].type,
            file: e.target?.files[i],
          });
          this.showDialog = true ;
        }
      }
    }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
