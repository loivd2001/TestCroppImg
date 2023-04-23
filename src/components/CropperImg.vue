<template>
    <v-dialog v-model="dialogFlag" fullscreen persistent transition="dialog-bottom-transition">
      <v-card class="cropper-img">
        <v-toolbar dark color="primary" class="cropper-img__header">
          <v-btn  @click="onCloseDialog">
            Close
          </v-btn>
          <v-spacer></v-spacer>
        </v-toolbar>
        <div class="cropper-img__content">
          <div class="cropper-img__content__wrapper">
            <div
              class="cropper-img__content__wrapper__back-btn"
              @click="onBackImage(activeIndex)"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </div>
            <section class="cropper-img__content__wrapper__copper-area">
              <div
                class="cropper-img__content__wrapper__copper-area__name-img text--primary"
              >
                {{ `${activeIndex + 1} / ${arrayImg.length}` }}
                <span class="ml-4 text--secondary">
                  {{ `${arrayImg[activeIndex]?.fileName}` }}</span
                >
              </div>
              <div>
                <vue-cropper
                  style="height: 320px"
                  ref="cropper"
                  :aspectRatio="1/1"
                  :initialAspectRatio="1/1"
                  :src="arrayImg[activeIndex]?.url"
                  :zoomOnTouch="false"
                  :zoomOnWheel="false"
                  @ready="onReady"
                  @cropend="onCropEnd"
                />
              </div>
            </section>
            <div
              class="cropper-img__content__wrapper__next-btn"
              @click="onNextImage(activeIndex)"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </div>
          </div>
          <div class="cropper-img__content__wrapper-btn-action">
            <v-btn
              outlined
              color="black"
              class="cropper-img__content__wrapper-btn-action__btn-action-item"
              @click.prevent="onResetCropInfo"
            >
              reset
            </v-btn>
            <div class="cropper-img__content__wrapper-btn-action__zoom-img">
              <v-btn
                color="secondary"
                class="cropper-img__content__wrapper-btn-action__zoom-img__btn-item"
                dark
                @click.prevent="onZoom(0.2)"
                ><v-icon dark> mdi-magnify-plus-outline </v-icon>
                zomm in
              </v-btn>
              <v-btn
                color="secondary"
                class="cropper-img__content__wrapper-btn-action__zoom-img__btn-item"
                dark
                @click.prevent="onZoom(-0.2)"
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
                @click.prevent="onRotate(-45)"
              >
                <v-icon dark> mdi-restore </v-icon> rotate left
              </v-btn>
              <v-btn
                color="secondary"
                class="cropper-img__content__wrapper-btn-action__rotate-img__btn-action-item"
                dark
                @click.prevent="onRotate(45)"
              >
                <v-icon dark> mdi-reload </v-icon>rotate right
              </v-btn>
            </div>
          </div>
          <div class="cropper-img__content__wrapper-item-img" style="gap: 12px">
            <div
              v-for="(item, index) in arrayImg"
              :key="index"
              @click.prevent="onChangePreviewImage(item, index)"
              :class="activeIndex === index
                ? 'wrapper-preview active-preview'
                : 'wrapper-preview no-active-preview'"
            >
              <div :class="activeIndex === index ? 'preview__cropper' : ''">
                <img
                  v-if="cropDataList[index] && cropDataList[index].url"
                  :src="cropDataList[index].url"
                />
                <img v-else :src="item.url" />
              </div>
            </div>
          </div>
        </div>
        <div class="cropper-img__actions">
          <v-btn
            class="cropper-img__actions__btn-cancel"
            @click="onCloseDialog"
          >Cancel</v-btn>
          <v-btn
            color="#4CAF50"
            dark
            class="cropper-img__actions__btn-submit"
            @click="onSaveImage"
          >Save</v-btn>
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
      showDialogFlag: {
        type: Boolean,
        default: false,
      },
      arrayImg: {
        type: Array,
        default: () => [],
        require: true,
      },
      saveFunc: {
        type: Function,
        default: () => {},
        require: true,
      },
    },
  
    data() {
      return {
        activeIndex: 0,
        cropDataList: [],
        isChangeImg: false,
      };
    },
    computed: {
      dialogFlag: {
        get() {
          return this.showDialogFlag;
        },
        set(value) {
          this.$emit('input', value);
        },
      },
    },
  
    methods: {
      /**
       * Trigger this event before crop event
       * Init crop data in case of first loading
       * Set crop info by previous crop data when clicking img on preview
       */
      onReady() {
        if (this.cropDataList.length) {
          // Check to set previous crop data
          if (this.isChangeImg) {
            // Set crop info
            const cropInfo = this.cropDataList[this.activeIndex];
            if (cropInfo) {
              // Set crop info
              if (cropInfo.cropData) {
                this.$refs.cropper.setCropBoxData(cropInfo.cropData);
              }

              // Set rotate info
              if (cropInfo.rotateInfo) {
                this.$refs.cropper.rotate(cropInfo.rotateInfo);
              }

              // Set zoom & rotate info
              if (cropInfo.canvasInfo) {
                this.$refs.cropper.setCanvasData(cropInfo.canvasInfo);
              }

              // Save crop image
              this.saveCropImage(this.activeIndex);
            }

            this.isChangeImg = false;
          }
        } else {
          // First load, init crop info for all images
          this.saveCropInfo(this.activeIndex);
        }
      },

      /**
       * Save crop info
       */
      onCropEnd() {
        this.saveCropInfo(this.activeIndex);
      },

      /**
       * Save crop info
       */
      onResetCropInfo() {
        // Reset crop info
        this.$refs.cropper.reset();

        // Save reset info
        this.saveCropInfo(this.activeIndex);

        // Save zoom & rotate info
        this.saveCanvasInfo(this.activeIndex);

        // Save crop image after resetting
        this.saveCropImage(this.activeIndex);
      },

      /**
       * Zoom image
       * Zoom in: +20
       * Zoom out: -20
       */
      onZoom(percent) {
        // Zoom image
        this.$refs.cropper.relativeZoom(percent);

        // Save zoom info
        this.saveCanvasInfo(this.activeIndex);
      },

      /**
       * Rotate image
       * Left: -45
       * Right: 45
       */
      onRotate(degree) {
        // Rotate image
        this.$refs.cropper.rotate(degree);

        // Save canvas info for rotate
        this.saveCanvasInfo(this.activeIndex);
      },

      /**
       * Change image for preview
       * @param item Img info
       * @param index Index of image list
       */
      onChangePreviewImage(item, index) {
        // Check img info
        if (!item) return;

        // Set current index
        this.activeIndex = index;

        // Set flag change img to load crop, zoom & rotate
        this.isChangeImg = true;

        // Set crop img
        this.$refs.cropper.replace(item.url);
      },

      /**
       * Back image
       * @param index Index of image list
       */
      onBackImage(index) {
        const previousIndex = index - 1;
        if (previousIndex < 0) return;

        // Set current index
        this.activeIndex = previousIndex;

        // Back image
        this.onChangePreviewImage(
          this.arrayImg[previousIndex],
          previousIndex,
        );
      },

      /**
       * Next image
       * @param index Index of image list
       */
      onNextImage(index) {
        const nextIndex = index + 1;
        if (nextIndex > this.arrayImg.length - 1) return;

        // Set current index
        this.activeIndex = nextIndex;

        // Next image
        this.onChangePreviewImage(
          this.arrayImg[nextIndex],
          nextIndex,
        );
      },

      /**
       * Destroy crop when close or cancel
       */
      onCloseDialog() {
        // Init data
        this.activeIndex = 0;
        this.cropDataList = [];

        // Destroy crop
        this.$refs.cropper.destroy();

        // Set data null
        this.$refs.cropper.setData(null);

        // Close dialog
        this.dialogFlag = false;
      },

      /**
       * Save image info after adjusting
       */
      async onSaveImage() {
        let dataList = [];

        // Get image info
        this.arrayImg.forEach((item, i) => {
          const cropInfo = this.cropDataList[i];

          // Get image info
          let imageInfo = Object.assign({}, item);
          if (cropInfo) {
            if (cropInfo.url) {
              imageInfo.url = cropInfo.url;
              imageInfo.file = cropInfo.file;
            }

            // TODO need to confirm this information needed or not
            // cropData, canvasInfo, rotateInfo
            if (cropInfo.cropData) {
              imageInfo.cropData = cropInfo.cropData;
            }

            if (cropInfo.canvasInfo) {
              imageInfo.canvasInfo = cropInfo.canvasInfo;
            }

            if (cropInfo.rotateInfo) {
              imageInfo.rotateInfo = cropInfo.rotateInfo;
            }
          }

          dataList.push(imageInfo);
        });

        // Save image info
        await this.saveFunc(dataList);

        // Close dialog
        this.onCloseDialog();
      },

      /**
       * Set crop data { width, height, left, top }
       * @param index Index of image list
       */
      saveCropInfo(index) {
        let cropInfo = this.$refs.cropper.getCropBoxData();
        if (this.cropDataList.length) {
          // Update crop data
          this.cropDataList = this.cropDataList.map((item, i) => {
            if (index === i) {
              item.cropData = cropInfo;
            }

            return item;
          });
        } else {
          // Init crop data
          let tmpCropDataList = [];

          const arrayLength = this.arrayImg.length;
          for (let i = 0; i < arrayLength; i++) {
            tmpCropDataList[i] = {
              cropData: cropInfo,
            };
          }

          this.cropDataList = tmpCropDataList;
        }

        // Save crop image
        this.saveCropImage(index);
      },

      /**
       * Save canvas info including zoom & rotate
       * @param index Index of image list
       */
      saveCanvasInfo(index) {
        // Skip save canvas if there is no image
        if (!this.cropDataList.length) return; 

        this.cropDataList = this.cropDataList.map((item, i) => {
          if (index === i) {
            item.canvasInfo = this.$refs.cropper.getCanvasData();

            // Get rotate info
            const data = this.$refs.cropper.getData();
            if (data) {
              item.rotateInfo = data.rotate;
            }
          }

          return item;
        });

        // Save crop image
        this.saveCropImage(index);
      },

      /**
       * Save crop image info
       * @param index Index of image list
       */
      saveCropImage(index) {
        const cropCanvas = this.$refs.cropper.getCroppedCanvas(),
          imageInfo = this.arrayImg[index];
        
        // Skip getting crop info
        if (!cropCanvas || !imageInfo) return;

        // Get crop image
        cropCanvas.toBlob(
          (blob) => {
            const fileInfo = new File([blob], imageInfo.fileName, {
              type: imageInfo.type,
              lastModified: Date.now(),
              size: blob.size,
            });

            // Set crop file info
            this.cropDataList = this.cropDataList.map((item, i) => {
              if (i === index) {
                item.url = cropCanvas.toDataURL(imageInfo.type);
                item.file = fileInfo;
              }

              return item;
            });
          },
          imageInfo.type,
        );
      },

      /**
       * Init crop when open crop dialog when loading the send times or above
       */
      initCrop() {
        this.$refs.cropper.initCrop();
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
        margin-top: 20px;
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

  .wrapper-preview {
    // Add height for wrapper and div inside to avoid padding preview area
    height: 80px;

    > div {
      height: 80px;
    }

    img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border: 2px solid rgb(56, 53, 53);
    }

    &.active-preview {
      img {
        border: 4px solid red;
      }
    }
  }
</style>
