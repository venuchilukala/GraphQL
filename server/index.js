const express = require('express')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { default: axios } = require('axios')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')

// Import JSON files directly (No need for fs.readFileSync)
// const todos = require('./todos.json')
// const users = require('./users.json')

// Read JSON files
const todos = JSON.parse(fs.readFileSync('./todos.json', 'utf-8'))
const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'))


async function startServer() {
    const app = express()
    const server = new ApolloServer({
        typeDefs: `
            type User {
                id: ID!
                name: String!
                username: String!
                email: String!
                phone: String!
                website: String!
            }

            type Todo {
                id: ID!
                title: String!
                completed: Boolean
                user: User
            }
            
            type Query {
                getTodos: [Todo]
                getUsers: [User]
                getUser(id: ID!): User 
            }
        `,
        resolvers: {
            Todo: {
                user: async (todo) => users.find(user => user.id === todo.userId),
            },

            Query: {
                getTodos: async () => todos,
                getUsers: async () => users,
                getUser: async (_, { id }) => users.find(user => user.id === parseInt(id)),
            }
        }
    })

    app.use(bodyParser.json())
    app.use(cors())

    await server.start()
    app.use("/graphql", expressMiddleware(server))

    app.listen(8000, () => console.log(`Server started at http://localhost:8000`))
}
startServer()

