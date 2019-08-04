//组件注册
Vue.component('todo-item',{
    template:'#todo-item',
    data:function(){
        return {
            editedTodo:null  //用户暂存编辑前的todo状态
        }
    },
    props:{
        todo: {
            type:Object,
            required:true,
        }
    },
    methods:{
        markAsCompleted:function(todo){
            todo.completed = true
        },
        markAsUnCompleted:function(todo){
            todo.completed = false
        },
        removeTodo:function(todo){
            this.$emit('remove-todo',todo)
        },
        editTodo:function(todo){
            this.editedTodo = {id:todo.id,title:todo.title}
        },
        editDone:function(todo){
            if(todo.title === ''){
                this.removeTodo(todo)
            }
            this.editedTodo = null
        },
        cancelEdit:function(todo){
            todo.title = this.editedTodo.title;
            this.editedTodo = null
        }
    },
    computed:{
        editimg:function(){
            return this.editedTodo !== null && this.editedTodo.id === this.todo.id
        }
    },
    directives:{
        focus :{
            inserted:function(el){
                el.focus()
            }
        }
    }
});

var STORAGE_KEY = 'vue2.x-todo-tutorial';
var todoStorage = {
    fetch:function(){
        var todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        todos.forEach(function(todo,index){
            todo.id = index
        });
        todoStorage.uid = todos.length;
        return todos
    },
    save:function(todos){
        localStorage.setItem(STORAGE_KEY,JSON.stringify(todos))
    }
};
var id = 0;
var app = new Vue({
    el:'#todo-app',
    data:function(){
        return{
            todos:[],
            newTodoTitle:'',
            intention:'all',
            removedTodo:null,
            recycleBin: [],  //用于存放已经删除的todo
            editedTodo: null,    //用户暂存编辑前的todo状态
            checkEmpty:false  //添加一个检查空值标志
        }
    },
    //监测todos列表的变化，将变化存储到local storage
    watch:{
        todos:{
            handler:function(todos){
                todoStorage.save(todos)
            },
            deep:true
        }
    },
    methods: {
        addTodo: function () {
            if(this.newTodoTitle === ''){
                this.checkEmpty = true;
                return
            }
            this.todos.push(
                // 修改后的 todo 模型
                {id: id++, title: this.newTodoTitle, completed: false, removed: false}
            );
            this.newTodoTitle = '';
            this.checkEmpty = false;
        },
        removeTodo: function (todo) {
            let removedTodo = this.todos.splice(this.todos.indexOf(todo), 1)[0];
            removedTodo.removed = true;
            this.recycleBin.unshift(removedTodo);
        },
        markAllAsCompleted: function () {
            this.todos.map(function (todo) {
                if (!todo.completed) {
                    todo.completed = true
                }
            })
        },
        clearCompleted: function () {
            if (!confirm('确认清除全部已完成的待办事项？')) {
                return
            }
            this.completedTodos.map(todo => todo.removed = true);
            this.recycleBin.unshift(...this.completedTodos);
            this.todos = this.leftTodos;
        },
        clearAll: function () {
            if (!confirm('确认清除全部待办事项？')) {
                return
            }
            this.todos.map(todo => todo.removed = true);
            this.recycleBin.unshift(...this.todos);
            this.todos = [];
        },
        restoreTodo:function(){
            todo.removed = false;
            this.todos.unshift(todo);
            var pos = this.recycleBin.indexOf(todo);
            this.recycleBin(pos,1)
        }
    },
    computed:{
        leftTodos:function(){
            return this.todos.filter(todo => !todo.completed)
        },
        leftTodosCount:function(){
            return this.leftTodos.length
        },
        filteredTodos: function () {
            if (this.intention === 'ongoing') {
                return this.leftTodos
            } else if (this.intention === 'completed') {
                return this.completedTodos
            } else if (this.intention === 'removed') {
                return this.recycleBin
            } else {
                // 其它未定义的意图我们为其返回全部 todos，
                // 这里面已经包含了 all 意图了
                return this.todos
            }
        },
        emptyChecked:function(){
            return this.newTodoTitle.length === 0 && this.checkEmpty;
        },
        hasRemovedTodo:function(){
            return !!this.removedTodo
        },
        completedTodos: function () {
            return this.todos.filter(todo => todo.completed)
        },
        completedTodosCount: function () {
            return this.completedTodos.length
        },
    }
})