
<template>
    <el-container>
        <el-main style="overflow:hidden;">
            <el-tabs v-model="activeName" type="border-card">
                <el-tab-pane label="管理" name="config">
                    <el-container style="height: calc(100vh - 260px);">
                        <el-main>
                            <el-form label-width="80px" style="height:100%;">
                                <el-form-item label="名称">
                                    <el-input v-model="model.name"></el-input>
                                </el-form-item>

                                <el-form-item label="备注">
                                    <el-input type="textarea" v-model="model.attr.remark"></el-input>
                                </el-form-item>

                                <el-form-item label="创建时间">
                                    <el-input :value="model.ctime | toLocalTime" disabled></el-input>
                                </el-form-item>

                                <el-form-item label="更新时间">
                                    <el-input :value="model.mtime | toLocalTime" disabled></el-input>
                                </el-form-item>

                                <el-form-item label="目录">
                                    <el-input v-model="model.parent" disabled></el-input>
                                </el-form-item>

                                <el-form-item label="类型">
                                    <el-input v-model="model.ftype" disabled></el-input>
                                </el-form-item>

                                <el-form-item label="大小">
                                    <el-input :value="model.size | formatSize" disabled></el-input>
                                </el-form-item>

                                <el-form-item label="作者">
                                    <el-input v-model="model.attr.author" disabled></el-input>
                                </el-form-item>
                                
                                <el-form-item label="图标">
                                    <el-button @click="activeName='icon'">
                                        <el-image :src="icon.value" style="width:64px;" ></el-image>
                                    </el-button>
                                </el-form-item>
                                
                                <el-form-item label="标签">
                                    <TagView domain='files' :model.sync="model.tags" :id="model.id" limit="4"></TagView>
                                </el-form-item>

                            </el-form>
                        </el-main>
                    </el-container>
                </el-tab-pane>
                <el-tab-pane label="图标" name="icon">
                    <el-container style="height: calc(100vh - 260px);">
                        <el-main>
                            <el-radio-group v-model="icon.value" style="display:flex;flex-wrap:wrap;align-content:center;" @change="onIconChange">
                                <el-button type="default" 
                                    style="width:8em;max-width:8em;height:90px;height:auto;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);" v-for="icon in icon.list" :key="icon.id">
                                    <p>
                                        <el-radio :label="icon | pickIcon">
                                            <el-image :src="icon | pickIcon" style="max-width: 55px;min-width: 55px;"></el-image>
                                            <span slot="label">{{icon.id}}</span>
                                        </el-radio>
                                    </p>
                                </el-button>
                            </el-radio-group> 
                        </el-main>
                    </el-container>
                </el-tab-pane>
            </el-tabs>    
        </el-main>
        <el-footer style="line-height:60px;text-align:center;">
            <el-button type="primary" @click="onSave">确定</el-button>
            <el-button type="default" @click="onClose">取消</el-button>
        </el-footer>
    </el-container>
</template>

<script>
    import TagView from '../tags/TagView.vue';
    export default {
        props:{
            node: Object,
            inst: Object
        },
        components:{
            TagView
        },
        data(){
            return{
                model: {
                    name: "",
                    attr: {
                        remark: ""
                    },
                    tags: []
                },
                icon: {
                        value: `/static/assets/images/files/png/${this.node.ftype}.png`,
                        list: []
                },
                attr:{
                    remark: ""
                },
                activeName: 'config'
            }
        },
        filters:{
            formatSize(val){
                return this.m3.utils.bytesToSize(val);
            }
        },
        created(){
            
            try{

                // 初始化model
                _.extend(this.model,this.node);

                // 初始化attr
                if(_.isEmpty(this.model.attr)){
                    _.extend(this.model, {attr:this.attr});   
                } else {
                    _.extend(this.model, {attr: JSON.parse(this.model.attr)});   
                }

                // 如果属性没有icon定义，默认根据ftype文件类型显示
                let icon = JSON.parse(this.model.attr).icon;
                if(!_.isEmpty(icon)){
                    this.icon.value = icon;
                }
            } catch(err){

            }
            
            // 初始化图片列表
            this.m3.dfs.list({fullname:'/assets/images/files/png'}).then( (rtn)=>{
                this.icon.list = rtn.message;
            } );
        },
        filters: {
            pickIcon(item) {
                return `/static${item.parent}/${item.name}`;
            },
            toLocalTime(value) {
                return moment(value).format(window.m3.global.register.format);
            }
        },
        methods: {
            onLoad(){
                this.$emit("dfs-refresh");
            },
            onSave(){
                this.saveName();
                this.saveAttr();
            },
            onClose(){
                this.inst.show = false;
            },
            onIconChange(val){
                this.activeName = 'config';
            },
            saveName(){
                
                if(this.model.name === this.node.name){
                    return false;
                }

                let data = {parent:this.node.parent, name:this.model.name};
                
                this.m3.dfs.check(data).then(check=>{
                    
                    if(check) {
                        this.$message({
                            type: "warning",
                            message: "文件已存在，请确认！"
                        });
                        return false;
                    }

                    let rnData = {srcpath: this.node.parent + "/" + this.node.name, dstpath:this.node.parent + "/" + this.model.name};

                    this.m3.dfs.rename(rnData).then( rtn=>{
                        if(rtn.status === 'ok'){
                            this.onLoad();
                        }else {
                            this.onLoad();
                            this.$message({
                                type: "error",
                                message: "重命名失败 " + rtn.message
                            })
                        }
                    })
                });
                
            },
            saveAttr(){
                
                
                _.extend(this.model.attr, {icon: this.icon.value});
                let node = _.cloneDeep(this.node);
                _.extend(node, this.model);
                
                this.m3.dfs.updateAttr(node).then(rtn=>{
                    if(rtn.status === 'ok'){
                        this.onLoad();
                    } else {
                        this.$message({
                            type: "error",
                            message: "属性更新失败 " + rtn.message
                        })
                    }
                })
                
            }
        }
    }
</script>

<style scoped>
    
</style>