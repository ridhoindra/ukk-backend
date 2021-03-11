import { Wrapper } from '../../../utils/helpers/wrapper';
import { Command } from './command';
import { Query } from '../queries/query';
import { generate } from "../../../utils/auth/jwtAuth";
import { expiredToken } from "../utils/constans";
import bcryptjs from "bcryptjs";

export default interface ICommandWorker{
    registerPetugas(payload: any): any
}

export class CommandWorker implements ICommandWorker{
    command: Command
    query: Query
    wrapper: Wrapper
    bcrypt = bcryptjs
    constructor() {
        this.command = new Command()
        this.query = new Query()
        this.wrapper = new Wrapper()
    }

    async registerPetugas(payload: any) {
        let { name, username, password, telp }= payload
        const checkUser: any = await this.query.findOnePetugas({username})
        if (checkUser.data) {
            return this.wrapper.error('Username Already Registered')
        }
        // const checkLevel : any = await this.query.checkLevel({level})
        // console.log(checkLevel);
        
        // if (checkLevel == false) {
        //     return this.wrapper.error('Level Doesnt Exist')
        // }
        password = this.bcrypt.hashSync(payload.password, this.bcrypt.genSaltSync(10))
        const data = {
            name,
            username,
            password,
            telp,
            role: 'petugas',
            createdAt: new Date(Date.now())
        }
        const result: any = await this.command.insertOne(data)
        if (result.err) {
            return this.wrapper.error(result)
        }
        return this.wrapper.data(data)
    }

    async deleteUser(payload: any){
        const checkUser: any = await this.query.findById(payload)
        if (checkUser.err) {
            return this.wrapper.error('User Not Found')
        }
        const result: any = await this.command.deleteOne(payload)
        if (result.err) {
            return this.wrapper.error('fail delete user')
        }
        return this.wrapper.data(result.data)
    }

    async updateOne(payload: any){
        let { id, name, username, password, telp } = payload
        const checkUser: any = await this.query.findById(id)
        if (checkUser.err) {
            return this.wrapper.error('User Not Found')
        }
        const checkUsername: any = await this.query.findOnePetugas({username: username.toLowerCase()})
        if (checkUsername.data.username !== checkUser.data.username && username !== checkUser.username) {
            return this.wrapper.error('Username Already Registered')
        }
        const data = {
            name,
            username: username.toLowerCase(),
            password: checkUser.data.password,
            telp,
            updatedAt: new Date(Date.now())
        }
        const compare = this.bcrypt.compareSync(password, checkUser.data.password)
        if (compare === false) {
            data.password = this.bcrypt.hashSync(payload.password, this.bcrypt.genSaltSync(10))
        }
        const result: any = await this.command.updateOne(id, {$set:{...data}})
        if (result.err) {
            return this.wrapper.error('Fail Update Data')
        }
        return this.wrapper.data(result.data)
    }

    // async loginPetugas(payload: any) {
    //     const { username, password } =payload
    //     const result: any = await this.query.findOnePetugas({username})
    //     if (result.err) {
    //         return this.wrapper.error('User Not Found')
    //     }
    //     const data = result.data
    //     // data.accessRole = data.level
        
    //     const compare = this.bcrypt.compareSync(password, data.password)
    //     if (compare==false) {
    //         return this.wrapper.error("Username And Password Not Match")
    //     }
    //     const accessToken= await generate(data, expiredToken.accessToken)
    //     const token = {
    //         name: data.name,
    //         username: data.username,
    //         accessToken,
    //         expired: expiredToken.accessToken,
    //     }
    //     return this.wrapper.data(token)
    // }
}