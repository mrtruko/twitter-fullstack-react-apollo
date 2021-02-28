import 'reflect-metadata';
import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from "./mikro-orm.config";
// import { Post } from './entities/Post';
import {HelloResolver} from './resolvers/hello'

import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';



const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);
    
    await orm.getMigrator().up();

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
        session({
            store: new RedisStore({client: redisClient}),
            secret: '',
            resave: false
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: () => ({em: orm.em})
    })
    apolloServer.applyMiddleware({app})
    app.listen(4000, () => {
        console.log('Server started on localhost:4000');
    })
}


main().catch((err) => {
    console.log(err)
})