<template>
    <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
      <v-card class="cropper-img">
        <v-toolbar dark color="primary" class="cropper-img__header">
          <v-btn  @click="dialog = false">
            Close
          </v-btn>
          <v-spacer></v-spacer>
        </v-toolbar>
        <div class="cropper-img__content">
          <div class="cropper-img__content__wrapper">
            <div
              class="cropper-img__content__wrapper__back-btn"
              @click="handleBackAndNext(arrayImg, false)"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </div>
            <section class="cropper-img__content__wrapper__copper-area">
              <div
                class="cropper-img__content__wrapper__copper-area__name-img text--primary"
              >
                {{ `${activeIndex + 1} / ${arrayImg?.length}` }}
                <span class="ml-4 text--secondary">
                  {{ `${arrayImg[activeIndex]?.fileName}` }}</span
                >
              </div>
              <div>
                <vue-cropper
                  style="height: 320px"
                  ref="cropper"
                  :aspect-ratio="9 / 9"
                  :auto-crop-area="1"
                  :src="arrayImg[activeIndex]?.url"
                  preview=".preview__cropper"
                  @ready="setCropData(activeIndex)"
                  @crop="change"
                />
              </div>
            </section>
            <div
              class="cropper-img__content__wrapper__next-btn"
              @click="handleBackAndNext(arrayImg, true)"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </div>
          </div>
          <div class="cropper-img__content__wrapper-btn-action">
            <v-btn
              outlined
              color="black"
              class="cropper-img__content__wrapper-btn-action__btn-action-item"
              @click.prevent="reset"
            >
              reset
            </v-btn>
            <div class="cropper-img__content__wrapper-btn-action__zoom-img">
              <v-btn
                color="secondary"
                class="cropper-img__content__wrapper-btn-action__zoom-img__btn-item"
                dark
                @click.prevent="zoom(0.2)"
                ><v-icon dark> mdi-magnify-plus-outline </v-icon>
                zomm in
              </v-btn>
              <v-btn
                color="secondary"
                class="cropper-img__content__wrapper-btn-action__zoom-img__btn-item"
                dark
                @click.prevent="zoom(-0.2)"
              >
                <v-icon dark> mdi-magnify-minus-outline </v-icon
                >zomm out
              </v-btn>
            </div>
            <div class="cropper-img__content__wrapper-btn-action__rotate-img">
              <v-btn
                color="secondary"
                class="cropper-img__content__wrapper-btn-action__rotate-img__btn-action-item"
                dark
                @click.prevent="rotate(-45)"
              >
                <v-icon dark> mdi-restore </v-icon> rotate left
              </v-btn>
              <v-btn
                color="secondary"
                class="cropper-img__content__wrapper-btn-action__rotate-img__btn-action-item"
                dark
                @click.prevent="rotate(45)"
              >
                <v-icon dark> mdi-reload </v-icon>rotate right
              </v-btn>
            </div>
          </div>
          <div class="cropper-img__content__wrapper-item-img" style="gap: 12px">
            <div
              v-for="(item, index) in arrayImg"
              :key="index"
              @click.prevent="handleItem(item, index)"
            >
              <div
                v-if="activeIndex === index"
                class="preview__cropper"
                style="width: 80px; height: 80px; margin-right: 8px"
              />
              <img
                v-else-if="cropImgs.some((item) => item.index === index)"
                :src="cropImgs.find((item) => item.index === index).url"
                class="item_action"
              />
              <img v-else :src="arrayImg[index].url" class="item_action" />
            </div>
          </div>
        </div>
        <div class="cropper-img__actions">
          <v-btn
            class="cropper-img__actions__btn-cancel"
            @click="dialog = false"
            >Cancel</v-btn
          >
          <v-btn
            color="#4CAF50"
            dark
            class="cropper-img__actions__btn-submit"
            @click="ClickEmitImg"
            >Save</v-btn
          >
        </div>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import VueCropper from "vue-cropperjs";
  import "cropperjs/dist/cropper.css";
  
  export default {
    components: {
      VueCropper,
    },
    props: {
      value: {
        type: Boolean,
        default: false,
      },
      arrayImg: {
        type: Array,
        default: () => [],
        require: true,
      },
    },
  
    data() {
      return {
        data: null,
        activeIndex: 0,
        dataUrlClick: [],
        cropImgs: [],
        cropDatas: [],
      };
    },
    computed: {
      dialog: {
        get() {
          return this.value;
        },
        set(value) {
          this.$emit("input", value);
        },
      },
    },
  
    methods: {
      change() {
        this.cropImage();
      },
      ClickEmitImg() {
        const data = [];
        for (let i = 0; i <= this.arrayImg?.length - 1; i++) {
          if (this.arrayImg[i]?.id === this.cropImgs[i]?.id) {
            data.push(this.cropImgs[i]);
          } else {
            data.push(this.arrayImg[i]);
          }
        }
        this.$emit("handleSaveImg", data);
      },
  
      handleBackAndNext(item, control) {
        if (control !== true) {
          if (this.activeIndex === 0) {
            return;
          }
          this.activeIndex = this.activeIndex - 1;
        } else {
          if (this.activeIndex + 1 === item?.length) {
            return;
          }
          this.activeIndex = this.activeIndex + 1;
        }
        this.cropImage();
        this.$refs.cropper.reset();
        this.saveCropData();
        if (typeof FileReader === "function") {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.$refs.cropper.replace(event.target.result);
          };
          reader.readAsDataURL(this.arrayImg[this.activeIndex]?.file);
        }
      },
      cropImage() {
        const cropCanvas = this.$refs.cropper.getCroppedCanvas();
        const id = this.arrayImg[this.activeIndex]?.id;
        const name = this.arrayImg[this.activeIndex]?.fileName;
        cropCanvas.toBlob(
          (blob) => {
            const file = new File([blob], `${Date.now + id}.png`, {
              type: "image/png",
              lastModified: Date.now(),
              size: blob.size,
            });
            if (!this.cropImgs.some((item) => item.index === this.activeIndex)) {
              this.cropImgs = [
                ...this.cropImgs,
                {
                  index: this.activeIndex,
                  url: cropCanvas.toDataURL(),
                  id: id,
                  fileName: name,
                  file: file,
                },
              ];
            } else {
              this.cropImgs = [
                ...this.cropImgs.filter(
                  (item) => item.index !== this.activeIndex
                ),
                {
                  index: this.activeIndex,
                  url: cropCanvas.toDataURL(),
                  id: id,
                  fileName: name,
                  file: file,
                },
              ];
            }
          },
          "image/png",
          1
        );
      },
  
      reset() {
        this.$refs.cropper.reset();
      },
      rotate(deg) {
        this.$refs.cropper.rotate(deg);
      },
  
      setData() {
        if (!this.data) return;
        this.$refs.cropper.setData(JSON.parse(this.data));
      },
  
      saveCropData() {
        const setData = {
          index: this.activeIndex,
          data: this.$refs.cropper.getData(),
        };
        if (!this.cropDatas.some((item) => item.index === this.activeIndex)) {
          this.cropDatas = [...this.cropDatas, setData];
        } else {
          this.cropDatas = [
            ...this.cropDatas.filter((item) => item.index !== this.activeIndex),
            setData,
          ];
        }
      },
  
      setCropData(index) {
        if (this.cropDatas.some((item) => item.index === index)) {
          const data = this.cropDatas.find((item) => item.index === index).data;
          this.$refs.cropper.setData(data);
        }
      },
  
      handleItem(item, index) {
        this.cropImage();
        this.saveCropData();
        this.activeIndex = index;
        if (typeof FileReader === "function") {
          const reader = new FileReader();
          reader.onload = (event) => {
            console.log("1",event);
            this.$refs.cropper.replace(event.target.result);
          };
          reader.readAsDataURL(item?.file);
        }
      },
  
      zoom(percent) {
        this.$refs.cropper.relativeZoom(percent);
      },
    },
  };
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style lang="scss">
  .cropper-img {
    &__header {
      position: fixed;
      left: 0;
      right: 0;
      border-top-left-radius: initial !important ;
      border-top-right-radius: initial !important;
      z-index: 100000000;
    }
  
    &__content {
      margin-top: 95px;
      &__wrapper-item-img{
        display: flex;
        justify-content: center;
        margin-top: 24px;
      }
      &__wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        &__back-btn {
          position: absolute;
          left: 0;
          margin-left: 24px;
          width: 56px;
          height: 56px;
          background: #0000001f;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          &:hover {
            cursor: pointer;
          }
          &:active {
            background-color: #dc2828;
          }
        }
        &__copper-area {
          z-index: 1000000;
          .cropper-bg {
            background-repeat: repeat;
          }
          width: 528px;
          &__name-img {
            text-align: center;
            margin-bottom: 10px;
          }
        }
        &__next-btn {
          position: absolute;
          right: 0;
          margin-right: 24px;
          width: 56px;
          height: 56px;
          background: #0000001f;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          &:hover {
            cursor: pointer;
          }
          &:active {
            background-color: #dc2828;
          }
        }
      }
      &__wrapper-btn-action {
        margin-top: 1.2rem;
        display: flex;
        justify-content: center;
        gap: 48px;
        &__btn-action-item {
          height: 36px;
          margin-left: 8px;
          font-weight: 700;
        }
        &__zoom-img {
          &__btn-item {
            height: 36px;
            margin-left: 8px;
            font-weight: 700;
          }
        }
        &__rotate-img {
          &__btn-action-item {
            height: 36px;
            margin-left: 8px;
            font-weight: 700;
          }
        }
      }
    }
  
    &__actions {
      position: fixed;
      right: 0;
      bottom: 0;
      margin: 0 20px 20px 0;
      &__btn-cancel {
        margin-left: 8px;
        font-weight: 600;
        border-radius: 4px;
        padding: 0px, 16px, 0px, 16px;
      }
      &__btn-submit {
        margin-left: 8px;
        font-weight: 600;
        border-radius: 4px;
        padding: 0px, 16px, 0px, 16px;
      }
    }
  }
  
  .item_action {
    width: 80px;
    height: 80px;
    display: block;
    object-fit: cover;
    border: 2px solid rgb(56, 53, 53);
    margin-right: 8px;
  }
  
  .preview__cropper {
    border: 4px solid red;
    width: 100%;
    height: calc(372px * (9 / 16));
    overflow: hidden;
  }
  </style>
  