Vue.component('todo-item', {
    template: '#todo-item',
    data: function () {
        return {
            editedTodo: null // 用户暂存编辑前的 todo 状态
        }
    },
    props: {
        todo: {
            type: Object,
            required: true,
        },
    },
    methods: {
        markAsCompleted: function (todo) {
            todo.completed = true
        },
        markNoCompleted:function(todo){
            todo.completed = flase
        },
        removeTodo: function (todo) {
            this.$emit('remove-todo', todo)
        },
        editTodo: function (todo) {
            this.editedTodo = {id: todo.id, title: todo.title}
        },
        editDone: function (todo) {
            this.editedTodo = null
        },
        cancelEdit: function (todo) {
            todo.title = this.editedTodo.title;
            this.editedTodo = null
        }
    },
    computed: {
        editing: function () {
            return this.editedTodo !== null && this.editedTodo.id === this.todo.id
        }
    },
    directives: {
        focus: {
            inserted: function (el) {
                el.focus()
            }
        }
    }
});
var STORAGE_KEY = 'vue2.x-todo-tutorial';
var todoStorage = {
    fetch: function () {
        var todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        todos.forEach(function (todo, index) {
            todo.id = index
        });
        todoStorage.uid = todos.length;
        return todos
    },
    save: function (todos) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    }
};
var app = new Vue({
    el: '#todo-app',
    data: function () {
        return {
            todos: todoStorage.fetch(),
            newTodoTitle: '',
            intention: 'all', // 默认为 all
        }
    },
    // 监测 todos 列表的变化，将变化存储到 local storage
    watch: {
        todos: {
            handler: function (todos) {
                todoStorage.save(todos)
            },
            deep: true
        }
    },
    methods: {
        addTodo: function () {
            this.todos.push(
                // 修改后的 todo 模型
                {id: todoStorage.uid++, title: this.newTodoTitle, completed: false}
            );
            this.newTodoTitle = '';
        },
        removeTodo: function (todo) {
            this.todos.splice(this.todos.indexOf(todo), 1)
        },
        markAllAsCompleted: function () {
            this.todos.map(function (todo) {
                if (!todo.completed) {
                    todo.completed = true
                }
            })
        },
        clearCompleted: function () {
            this.todos = this.todos.filter(todo => !todo.completed)
        },
        clearAll: function () {
            this.todos = []
        }
    },
    computed: {
        leftTodos: function () {
            return this.todos.filter(todo => !todo.completed)
        },
        leftTodosCount: function () {
            return this.leftTodos.length
        },
        filteredTodos: function () {
            if (this.intention === 'ongoing') {
                return this.leftTodos
            } else if (this.intention === 'completed') {
                return this.todos.filter(todo => todo.completed)
            } else {
                // 其它未定义的意图我们为其返回全部 todos，
                // 这里面已经包含了 all 意图了
                return this.todos
            }
        }
    }
})