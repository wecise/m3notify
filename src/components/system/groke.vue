// Grok变量管理
<template>
    <div ref="editor" style="border: 1px solid #ddd;"></div>
</template>

<script>
    export default {
        props: {
            value: String
        },
        mounted(){
            this.initEditor();
        },
        methods: {
            initEditor(){
                let editor = ace.edit(this.$refs.editor);
                editor.setOptions({
                    maxLines: Infinity,
                    minLines: 6,
                    autoScrollEditorIntoView: true,
                    enableBasicAutocompletion: true,
                    enableSnippets: true,
                    enableLiveAutocompletion: false
                });
                
                editor.getSession().setMode("ace/mode/sh");
                editor.setTheme("ace/theme/chrome");
                editor.getSession().setUseSoftTabs(true);
                editor.getSession().setTabSize(2);
                editor.getSession().setUseWrapMode(false);
                editor.renderer.setShowGutter(true);
                editor.setValue(this.value);
    
                editor.focus(); 
                let row = editor.session.getLength() - 1;
                let column = editor.session.getLine(row).length;
                editor.gotoLine(row + 1, column);

                editor.on("change", _.debounce((v)=>{
                    this.$emit('input-value', editor.getValue());
                },500));
            }
        }
    }
</script>