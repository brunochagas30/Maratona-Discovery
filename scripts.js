const Modal = { //control a + control a + control 1 - colapsa tudo primeiro nivel
    open() {
        document.querySelector('.modal-overlay') //seletor CSS
            .classList.add('active')
    },
    close() {
        document.querySelector('.modal-overlay')
            .classList.remove('active')

    }
}
const Storage = {
    get() { //retorno do string precisa ser transformado em array
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) //guarda string apenas se não usar o JSON

    }
}
const transactions = [{
    description: 'Água',
    amount: -16000,
    date: '27/02/2021',
}, {
    description: 'Academia',
    amount: -11000,
    date: '02/03/2021',
}, {
    description: 'Pigmeu',
    amount: 20000,
    date: '26/02/2021',
}, ]

const Transaction = { //responsável só pelo calculo matemático
    all: Storage.get(), //refatoração, para expandir aplicação (expandir as transações adicionadas para dentro do aplicativo posteriormente) (const transactions será apagada)

    add(transaction) { //adiciona transações e reccarrega, pega do array
        Transaction.all.push(transaction) //funcionalidade de array
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1) //deleta os dados  
        App.reload()
    },

    incomes() {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income //retorna o valor income, usado no updatebalance
    },
    expenses() {
        let expense = 0; //deve-se iniciar zerado antes da conta
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },
    total() {
        return Transaction.incomes() + Transaction.expenses();
    },
}
const DOM = {
    transactionsContainer: document.querySelector('#data_table tbody'),

    addTransaction(transaction, index) { //recebe a transação e coloca em um
        //index
        const tr = document.createElement('tr') //cria tr em formato de objeto
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index) //retorno do html dentro tr //index = posição do array
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) { //funcionalidade monta a mascára somente
        //cria somente a função de criação do html
        //boa prática uma função por funcionalidade//
        //retorna todo o conteúdo de todo o html no RETURN//

        //função if com um ternário===============================
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        //formatação da moeda

        const amount = Utils.formatCurrency(transaction.amount)

        const html = ` 
         <td class="description">${transaction.description}</td>
         <td class="${CSSclass}">${amount}</td>
         <td class="data">${transaction.date}</td>
         <td>
          <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="transação">
        </td>
      `
        return html
    },

    updateBalance() { //atualiza os cartões de acordo com variáveis dos ids definidos no HTML
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() { //criado para inteligencia do reload, evitando valores dobrados 
        DOM.transactionsContainer.innerHTML = ""
    }
}

//responsável por toda a formatação numérica, reutilizado amplamente no código
//acima
const Utils = {
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "" //formatação valor
            //expressão regular - reject /\D/g, 
        value = String(value).replace(/\D/g, "")
            //formatação do número 
        value = Number(value) / 100
            //inserção da moeda
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'), //link entre javascript e html

    //pega somente os valores

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value //pega somente os valores com o.value
        }
    },

    validateFields() {
        //const description = Form.getValues().description, // uma das formas (repete 3x)
        const { description, amount, date } = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },



    submit(event) {
        event.preventDefault()
        try {
            Form.validateFields() //verificar campos validos
            const transaction = Form.formatValues() //verificar formatos validos
            Form.saveTransaction(transaction) //adiciona as transações
            Form.clearFields() // Limpa os campos
            Modal.close() //fecha o modal
        } catch (error) {
            alert(error.message)
        }
    },
    //salvar
    //apagar os dados do formulário
    //modal feche
    //atualizar a aplicação
    //separa em funcionalidades diferentes e depois serão chamadas
}

Storage.get()

const App = { //variável de auxílio/início do aplicativo
    init() {
        Transaction.all.forEach(DOM.addTransaction) //criação da inteligência de transação)
        DOM.updateBalance() //popula os valores (adicionando novos)
        Storage.set(Transaction.all)
    },

    reload() { //reload deve limpar as transações
        DOM.clearTransactions() //evita duplicidade, volta a jogar o tbody vazio  
        App.init()
    },
}

App.init() //inicio do aplicativo