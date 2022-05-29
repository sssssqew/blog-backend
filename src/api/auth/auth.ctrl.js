import Joi from "joi"
import User from '../../models/user'

export const register = async ctx => {
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
  })
  const result = schema.validate(ctx.request.body)
  if(result.error){
    ctx.status = 400
    ctx.body = result.error
    return 
  }
  const { username, password } = ctx.request.body 
  try{
    const exists = await User.findByUsername(username)
    if(exists){
      ctx.status = 409 // conflict 
      return 
    }
    const user = new User({
      username
    })
    await user.setPassword(password) // 비밀번호 설정
    await user.save() // 데이터베이스에 저장

    ctx.body = user.serialize() 

    const token = user.generateToken()
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly: true, 
    })
  }catch(e){
    ctx.throw(500, e)
  }
}
export const login = async ctx => {
  const { username, password } = ctx.request.body 
  if(!username || !password){
    ctx.status = 401 // Unauthorized 
    return 
  }
  try{
    const user = await User.findByUsername(username)
    if(!user){
      ctx.status = 401 
      return 
    }
    const valid = await user.checkPassword(password)
    if(!valid){
      ctx.status = 401 
      return 
    }
    ctx.body = user.serialize()

    const token = user.generateToken()
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly: true, // XSS 해킹에 대한 보안
    })
  }catch(e){
    ctx.throw(500, e)
  }
}
export const check = async ctx => {
  const { user } = ctx.state 
  if(!user){
    ctx.status = 401 // Unathorized
    return 
  }
  ctx.body = user 
}
export const logout = async ctx => {
  ctx.cookies.set('access_token') // access_token 을 초기화하면 jwtMiddleware 함수에서 사용자 정보가 사라진다. 
  ctx.status = 204 // No Content 
}