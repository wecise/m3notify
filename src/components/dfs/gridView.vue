<template>
    <el-checkbox-group v-model="selected" class="content dfs-grid-container">
        <el-button type="default" 
                class="dfs-node"
                @dblclick.native="onDblClick(item)"
                @click="onTriggerClick(item)"
                v-for="item in dt.rows"
                :key="item.id">
                <div class="dfs-menu">    
                    <el-dropdown trigger="click" placement="top-start" @command="onMenuCommand">
                            <span class="el-dropdown-link">
                                <i class="el-icon-arrow-down el-icon--right"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item 
                                    :command="{fun:menuItem.fun,param:item,type:menuItem.type?menuItem.type:false}" 
                                    v-for="(menuItem,index) in getMenuByType(item)" 
                                    :key="index"
                                    :divided="menuItem | pickDivided">
                                    <i :class="menuItem.icon"></i> {{menuItem.name}}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                    </el-dropdown>
                </div>
                <el-image style="width:34px;height:34px;margin:5px;" :src="item | pickIcon"></el-image>
                <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:center;" v-show="item.editable">
                    <el-input v-model="item.name" 
                        type="textarea" 
                        autosize 
                        @keyup.enter.native="$event.target.blur"
                        @blur.self="onRename(item)" :ref="'input_'+item.id"></el-input>
                </p>
                <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:center;" @click.self="onSetFocus(item)" v-show="!item.editable">
                    {{item.name}}
                </p>
                <el-checkbox :label="item" :ref="'checkBox_'+item.id" v-show="selected.includes(item)"></el-checkbox>
        </el-button>
    </el-checkbox-group>
</template>

<script>
    import _ from 'lodash';
    export default {
        props: {
            model: Array,
            selected: Array
        },
        data(){
            return {
                dt:{
                    rows: []
                }
            }
        },
        watch: {
            model(){
                this.dt.rows = [...this.model];
            },
            selected:{
                handler(val){
                    this.$emit('update:selected',val)
                },
                deep: true
            }
        },
        filters: {
            pickName(item){

                if (_.isEmpty(item)) return '';

                let _name = _.head(item.name.split("."));

                if(!_.isEmpty(_name)){
                    _name = _.truncate(_name, {
                        'length': 9
                    });
                }

                return _name;
            },
            pickIcon(item){
                // extend || ...
                if( item.fullname === '/extend' ){
                    return `${window.assetsURLBase}/images/files/png/dir-lock.png`;
                } else {
                    try {
                        return _.attempt(JSON.parse.bind(null, item.attr)).icon || `${window.assetsURLBase}/images/files/png/${item.ftype}.png`;
                    }
                    catch(error){
                        return `${window.assetsURLBase}/images/files/png/${item.ftype}.png`;
                    }
                }

            },
            pickTags(item){

                if(item.tags){
                    return item.tags.join(",");
                } else {
                    return "";
                }
            },
            pickRemark(item){
                if (!_.isEmpty(item.attr) || !_.isEqual(item.attr, 'null')) {
                    return _.attempt(JSON.parse.bind(null, item.attr)).remark;
                }
            },
            pickDivided(item){
                try{
                    return item.divided;
                } catch(err) {
                    return false;
                }
            }
        },
        created(){
            this.dt.rows = [...this.model];
        },
        methods: {
            onDblClick(item){
                this.$emit('dbl-click',item);
            },
            onTriggerClick(item){
                this.$refs['checkBox_'+item.id][0].$el.click();
            },
            onSetFocus(item){
                setTimeout(()=>{
                    item.editable = true;
                    setTimeout(()=>{
                        this.$refs['input_'+item.id][0].$refs.textarea.focus();
                    },500)
                },500)
            },
            onMenuCommand(item){
                this.$emit("menu-command",item);
            },
            getMenuByType(item){
                let parent = this.$parent.$parent.$parent.$parent.$parent;
                return parent.getMenuByType(item);
            },
            onRename(item){
                if(_.find(this.model,{id:item.id}).name != item.name){
                    this.$root.$refs.viewRef.$children[0].onRename(_.find(this.model,{id:item.id}), item);
                } else {
                    item.editable = false;
                }
            }

        }

    }
</script>

<style scoped>
    .dfs-node{
        max-width: 12em;
        width: 12em;
        height:110px;
        border-radius: 10px!important;
        border: unset;
        box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);
        background: rgb(239, 244, 246);
        margin: 10px
    }

    .dfs-menu{
        position: relative;
        right: -50px;
    }

    .el-dropdown-menu.el-popper /deep/ .el-dropdown-menu__item{
        padding:5px 20px;
    }

</style>

<style>
    .dfs-grid-container .el-checkbox__input>.el-checkbox__inner {
        right: -60px;
        bottom: 0px;
    }
    .dfs-grid-container .el-checkbox__label{
        display: none;
    }
    .dfs-grid-container .el-checkbox__input > .el-checkbox__inner{
        border:unset;
    }
</style>