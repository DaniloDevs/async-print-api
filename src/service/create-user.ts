import { IUserRepository, User, UserCreateInput } from "../repository/user"
import { UserAlreadyExistsError } from "./_errors/user-alredy-exists";
import { hash } from 'bcryptjs'

interface RequestDate {
     name: string
     password: string
     email: string
}

interface ResponseDate {
     user: User;
}
export class RegisterService {
     constructor(private userRepository: IUserRepository) { }

     async execute({
          name, email, password
     }: RequestDate): Promise<ResponseDate> {
          const userWithSameEmail = await this.userRepository.findByEmail(email)

          if (userWithSameEmail) {
               throw new UserAlreadyExistsError()
          }

          const passwordHash = await hash(password, 6)

          const user = await this.userRepository.create({
               name,
               email,
               passwordHash,
               role: "admin",
          })

          return { user }
     }
}