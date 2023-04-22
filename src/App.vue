<template>
  <div id="app" data-app>
    <div>
        <v-btn
          outlined
          color="primary"
          class="background-white"
          @click="onChoseFile"
        >Upload Image</v-btn>
        <input
          hidden
          ref="uploader"
          class="d-none"
          type="file"
          accept=".png"
          multiple
          v-on:change="onChangeFile"
        />
        <CropperImg
          v-if="!isFirstLoading"
          ref="cropComponent"
          :showDialogFlag="showDialogFlag"
          :saveFunc="onSaveImage"
          :arrayImg="arrayImg"
          @input="showDialogFlag = $event"
        />
  </div>
</div>  
</template>

<script>
import CropperImg from './components/CropperImg';
export default {
  name: 'App',
  components:{
    CropperImg,
  },
  data(){
    return {
      arrayImg: [] ,
      showDialogFlag:false ,
      isFirstLoading: true,
    }
  } ,
  methods : {
    /**
     * Save cropped image info
     * @param dataList List image after cropping
     */
    async onSaveImage(dataList) {
      // TODO
      console.log('debug', dataList);
    },

    /**
     * Select image event
     */
    onChoseFile() {
      this.$refs.uploader.value = '';
      this.$refs.uploader.click();
    },

    /**
     * Select image file
     */
    onChangeFile(e) {
      const files = e.target.files,
        fileLength = files.length;
      this.arrayImg = [];
      for (let i = 0; i < fileLength; i++) {
        const fileInfo = files[i];

        this.arrayImg.push({
          id: Date.now() + i,
          fileName: fileInfo.name,
          type : fileInfo.type,
          file: fileInfo,
        });

        // Convert img to base64
        if (typeof FileReader === 'function') {
          const reader = new FileReader();
          reader.onload = (event) => {
            let updatedImg = this.arrayImg[i];
            updatedImg.url = event.target.result;
            this.arrayImg[i] = updatedImg;

            if (i >= fileLength - 1) {
              // Change img for cropper
              if (this.isFirstLoading) {
                this.isFirstLoading = false;
              } else {
                this.$refs.cropComponent.initCrop();
                this.$refs.cropComponent.onChangePreviewImage(this.arrayImg[0], 0);
              }

              this.showDialogFlag = true;
            }
          };
          reader.readAsDataURL(fileInfo);
        }
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
