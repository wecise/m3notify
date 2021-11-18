<template>

  <el-container>
    <el-header>
      <el-tooltip content="刷新">
        <el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
      </el-tooltip>
      <el-tooltip content="上传新媒介">
        <el-button type="text" @click="onUpload">
          <i class="el-icon-upload" style="color:#3ae23a;font-size:16px;"></i>
        </el-button>
      </el-tooltip>
    </el-header>
    <el-main>
      <el-table
        :data="dt.rows"
        border
        stripe
        height="calc(100vh - 215px)"
        style="width: 100%"
        ref="table">
        <template v-for="(item,index) in dt.columns">
            <el-table-column 
                :prop="item.field"
                :label="item.title" 
                sortable 
                show-overflow-tooltip
                :key="index"
                :width="item.width"
                :formatter="item.render"
                v-if="item.visible">
                <template slot-scope="scope">
                    <div style="height:30px;line-height:30px;" v-if="item.field=='tags'">
                        <TagView domain='notifyRule' :model.sync="scope.row.tags" :id="scope.row.id" :limit="1"></TagView>
                    </div>
                    <div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
                        v-else-if="typeof item.render === 'function'">
                    </div>
                    <div v-else>
                        {{scope.row[item.field]}}
                    </div>
                </template>
            </el-table-column>
        </template>
        <el-table-column label="操作"  width="220" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-video-play"  @click="onPlay(scope.$index, scope.row)" v-if="!scope.row.isPlay"> 播放</el-button>
            <el-button type="text" icon="el-icon-video-pause"  @click="onStop(scope.$index, scope.row)" v-else> 停止</el-button>
            <el-button type="text" icon="el-icon-delete"  @click="onDelete(scope.$index, scope.row)"> 删除</el-button>
            <el-button type="text" icon="el-icon-phone-outline"  v-if="scope.row.fullname===config.content.voice" style="color:green;"></el-button>
            <el-button type="text" icon="el-icon-phone-outline"  @click="onSetDefault(scope.$index, scope.row)" v-else>设为默认</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>

    <el-dialog title="上传声音媒介" :visible.sync="dialog.show" 
        :close-on-press-escape="false"
        :close-on-click-modal="false">
        <el-container style="height:100%;">
            <el-main style="padding:10px;">
                <div v-if="dialog.rtnInfo">
                    <el-button type="text" icon="el-icon-close" @click="clearUploadInfo"></el-button>
                    <section>
                        <code>{{dialog.rtnInfo.message.join(",")}}</code>
                    </section>
                </div>
                <el-upload name="uploadfile" 
                    class="upload-demo" 
                    drag :auto-upload="true"
                    :on-change="onUploadChange"
                    :on-success="onUploadSuccess"
                    :file-list="dialog.fileList"
                    accept=".mp3,.wav"
                    action="/fs/assets/audio?issys=true"
                    ref="upload"
                    v-else>
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__tip" slot="tip">只能上传声音文件</div>
                </el-upload>
            </el-main>
            <el-footer style="line-height:60px;text-align:center;">
                <el-button type="default" @click="onUploadCancel">取消</el-button>
            </el-footer>
        </el-container>
    </el-dialog>

  </el-container>
</template>

<script>
import _ from 'lodash';
import {Howl} from 'howler';
export default {
  name: "MediaView",
  props: {
    model: Object
  },
  data() {
    return {
      dt: {
        rows:[],
        columns: [],
        selected: []
      },
      sound: null,
      dialog: {
        show: false,
        fileList: [],
        rtnInfo: null
      },
      config:{
        root: '/script/matrix/m3event/notify',
        name: 'config.json',
        type: 'json',
        content: null
      }
    };
  },
  created(){
     this.initData();
  },
  methods: {
    initData(){

      this.m3.dfs.read({parent: this.config.root, name: this.config.name}).then( rtn=>{
          this.config.content = JSON.parse(rtn);
      })

      this.m3.callFS("/matrix/m3event/notify/getVoiceList.js",null).then((rt)=>{
        let rtn = rt.message;
        this.$set(this.dt,'rows', rtn.rows);
        this.$set(this.dt,'columns', _.map(rtn.columns, (v)=>{
                              
          if(_.isUndefined(v.visible)){
            _.extend(v, { visible: true });
          }

          if(!v.render){
            return v;
          } else {
            return _.extend(v, { render: eval(v.render) });
          }
          
        }));

        this.$nextTick(()=>{
          this.$refs.table.doLayout();
        })

      })
    },
    onRefresh(){
      this.initData();
    },
    onUpload(){
        this.dialog.show = true;
    },
    onPlay(index){
      
      if(this.sound){
        this.sound.stop();
      }

      let src = `/fs${this.dt.rows[index].fullname}?type=open&issys=true`;
      this.sound = new Howl({
        src: [src],
        volume: 1
      });
      this.sound.play();
      this.$set(this.dt.rows[index],'isPlay',true);
    },
    onStop(index){
      this.sound.stop();
      this.$set(this.dt.rows[index],'isPlay',false);
    },
    onDelete(index,item){

      this.$confirm(`确认要删除该声音文件：${item.name}？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).then(() => {
                        
        let param = {parent:item.parent, name: item.name};
        this.m3.dfs.deleteFile(param).then(()=>{
            this.$message({
                type: 'success',
                message: '删除声音文件成功!'
            });
            this.initData();
        }).catch((err)=>{
          this.$message({
              type: 'error',
              message: '删除声音文件失败 ' + err.message
          });
        })
        
        
      });
    },
    onSetDefault(index,row){
      console.log(index)
      
      _.extend(this.config.content,{voice: row.fullname});
      let content = JSON.stringify(this.config.content,null,2);
  
      let param = {
                    parent: this.config.root, name: this.config.name, 
                    data: { content: content, type: this.config.type, attr: "", index: true }    
                  };
      
      this.m3.dfs.write(param).then(()=>{
          this.$message({
            type: "success",
            message: "设置成功"
          })  
          this.initData();

      }).catch((err)=>{
          this.$message({
            type: "error",
            message: "设置失败 " + err.message
          })
      })
    },
    onUploadChange(file) {
      this.dialog.fileList = [file.raw];
    },
    onUploadCancel(){
      this.dialog.show = false;
    },
    onUploadSuccess(){
      this.initData();
    },
    clearUploadInfo(){
        this.dialog.rtnInfo = null;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  
  .el-header{
    height:40px!important;
    line-height:40px;
  }
  .el-main{
    overflow: hidden;
  }
</style>
