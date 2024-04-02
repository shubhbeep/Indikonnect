import axios from "axios";
import { Alert } from "react-native";
import {create} from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"




interface AuthState{
isAuthenticated:boolean,
user:{
    username:string,
    email:string,
    role:string,
} | null;
token: string | null;
setToken: (token: string | null) => void;
login: (username:string,password:string, onSuccess:()=> void) => void;
logout: () => void;
signup:(username:string, email:string, password:string, role:string,onSuccess:()=> void) => void
}


const useAuthStore = create<AuthState> ((set) => ({
    isAuthenticated:false,
    user:null,
    login:async (UserName:string,Password:string,onSuccess:()=> void) => {
        try{
            console.log("sending post req")
            const response = await axios.post("http://localhost:8000/sign-in", {UserName,Password});
            // console.log(response)
            if(response.status === 200){
                set({isAuthenticated:true, user:{username:response.data.user.UserName, email:response.data.user.Email,role:response.data.user.Role}});
                set({token:response.data.token})
                console.log("user: ",response.data.user.UserName,response.data.user.Email,response.data.user.Role)
                console.log("token:",response.data.token);
            }
            else{

                console.log("Invalid Username or Password ");
            }

            await AsyncStorage.setItem("authToken", response.data.token);
            
        onSuccess();
        } catch(error){
            console.log("Login failed: ",error);
            Alert.alert("Login failed","Invalid username or password!")
        }
        
    },

    logout:async () => {
        set({isAuthenticated:false, user:null});
        await AsyncStorage.removeItem("authToken")
    },

    signup:async (UserName:string, Email:string,Password:string, Role:string,onSuccess:() => void) => {
        try{
            const response = await axios.post('http://localhost:8000/create-user',{UserName,Email,Password,Role});
            // const response = {
            //         status:200,
            //         data:{
            //             username:"talksikk",
            //             email:"rohit.pansari9@gmail.com",
            //             role:"Shopkeeper"
            //         }
            // }

            console.log(response)
            if(response.status !== 201){
                throw new Error(response.data.message)
            }

            const userData = response.data;
            set({isAuthenticated:true,user:{
                username: userData.username,
                email:userData.email,
                role:userData.role
            },token:response.data.token});

            console.log(response.data.token)

            await AsyncStorage.setItem("authToken", response.data.token);
            
            console.log("Running on success")
            onSuccess();
            
        }catch(error){
            console.log("Signup failed: ", error);
            if (error.response && error.response.data && error.response.data.message) {
                // Display the error message from the server
                Alert.alert("Signup failed ", error.response.data.message);
            } else {
                // Handle other types of errors
                Alert.alert("Signup failed ", "An error occurred while signing up.");
            }
        }
    },
    token: null,
  setToken: (token) => set({ token }),
}))


export default useAuthStore