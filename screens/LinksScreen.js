import React from 'react';
import { ScrollView, StyleSheet, View, Text, KeyboardAvoidingView, TextInput, Button, Image } from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import db from "../db";
import auth from "../Auth"
import firebase from 'firebase';
import functions from 'firebase/functions'
import {ImagePicker} from "expo"
import {uploadImageAsync} from "../ImagesUtils"

export default class LinksScreen extends React.Component {
  state={
    records: [],
    users:[],
    email: "",
    name:null,
    password:"",
    message: "",
    logedIn: false,
    image: null,
    avatar: null,
    caption: null,
    imageEmail: null
  }
  users = []
  static navigationOptions = {
    title: 'Links',
  };

  componentDidMount = () =>{
    // Get all the users
    db.collection("users").onSnapshot(querySnapshot =>{
      this.users = []
      querySnapshot.forEach(doc => {
        this.users.push({id:doc.id, ...doc.data()});
      });
      console.log("Current login users: ", this.users.length)
    })
    // Get all the records
    db.collection("messages").orderBy("time").onSnapshot(querySnapshot =>{
      let records = []
      querySnapshot.forEach(doc => {
        records.push({id:doc.id, ...doc.data()});
      });
      this.setState({records})
    })
    // Listen to images 
    db.collection("image").onSnapshot(querySnapshot =>{
      let images = []
      querySnapshot.forEach(doc => {
        images.push({id:doc.id, ...doc.data()});
      });
      this.setState({imageEmail: images[0].email})
      console.log("Current imageEmail: ", images[0].email)
    })
  }

  loginOrRegister = async() => {
    let avatar = "default.png"
    try{
      await auth.signInWithEmailAndPassword(this.state.email, this.state.password)
      if(this.state.avatar){
         avatar = this.state.email
         await uploadImageAsync(this.state.avatar, this.state.email, "Avatars")
         await db.collection("users").doc(this.state.email).update({avatar})
      }
      
      if(this.state.name){
        await db.collection("users").doc(this.state.email).update({ name: this.state.name})

      }
      await db.collection("users").doc(this.state.email).update({ online: true})

      this.setState({logedIn: true})  
    }
    catch(error){
        var errorCode = error.code;
        console.log("errorCode: ", errorCode)
        var errorMessage = error.message;
        console.log("errorMessage: ", errorMessage)
      if(errorCode === "auth/user-not-found"){
      try{
        await auth.createUserWithEmailAndPassword(this.state.email, this.state.password)
        
        if(this.state.avatar){
          avatar = this.state.email
          await uploadImageAsync(this.state.avatar, this.state.email)
        }
        const name = this.state.name || this.state.email
        await db.collection("users").doc(this.state.email).set({name, online: true, avatar})
        
        await auth.signInWithEmailAndPassword(this.state.email, this.state.password)
        this.setState({logedIn: true})
      }
      catch(error){
        var errorCode = error.code;
        console.log("errorCode: ", errorCode)
        var errorMessage = error.message;
        console.log("errorMessage: ", errorMessage)
      }
    }
      
    }
            
  }

  create = async () => {
    //let result = db.collection("messages").add({username: auth.currentUser.email, message:this.state.message, time: new Date()})
    const addMessage = firebase.functions().httpsCallable('addMessage');
    const result = await addMessage({message: this.state.message})
    this.setState({ message: ""})
    console.log("Created? ", result)
  }

  pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      
    });
    console.log(result);
    if (!result.cancelled) {
      this.setState({ avatar: result.uri });
    }
  };

  uploadImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      
    });
    console.log(result);
    if (!result.cancelled) {
      await uploadImageAsync(result.uri, this.state.email, "images")
      await db.collection("users").doc(this.state.email).update({ caption: this.state.caption})
    }
  };

  makeURL = (email, folder)=>{
    return folder + "%2F" + email.replace("@","%40")
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
      {!this.state.logedIn ? 
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
      <View style={{  alignItems: 'center', justifyContent: 'center', marginBottom: "5%", borderRadius: 50 }}>
        {this.state.avatar &&
          <Image source={{ uri: this.state.avatar }} style={{ width: 200, height: 200 }} />}
      </View>
        {/* <Image source={{uri:"https://firebasestorage.googleapis.com/v0/b/cp3700-f238e.appspot.com/o/circle.png?alt=media&token=0b6c6b86-159f-48ec-b475-806e3a9cf769"}} style={{width:150, height:150, marginLeft: "auto", marginRight:"auto", marginBottom:"3%"}}/> */}
        <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1, width:"75%", marginBottom:"2%", marginLeft:"auto", marginRight:"auto"}}
        onChangeText={email => this.setState({email})}
        value={this.state.email}
        autoCapitalize = "none"
        placeholder="Email"
      />
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1, width:"75%", marginBottom:"2%", marginLeft:"auto", marginRight:"auto"}}
        onChangeText={name => this.setState({name})}
        value={this.state.name}
        placeholder="Name"
      />
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1, width:"75%", marginLeft:"auto", marginRight:"auto", maxHeight:50}}
        onChangeText={(password) => this.setState({password})}
        value={this.state.password}
        placeholder="Password"
        secureTextEntry={true}
      />
        <Button
          onPress={this.loginOrRegister}
          title="Login / Register"
        />
        <Button
          onPress={this.pickAvatar}
          title="Select Avatar"
        />
        <Button
          onPress={this.uploadImage}
          title="Upload Image"
        />
         <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1, width:"75%", marginBottom:"2%", marginLeft:"auto", marginRight:"auto"}}
        onChangeText={caption => this.setState({caption})}
        value={this.state.caption}
        placeholder="Caption"
      />
      </KeyboardAvoidingView>:
      <ScrollView>  
      {this.state.imageEmail !== null &&
        <View style={{marginBottom: "3%", marginLeft:"auto", marginRight: "auto"}}>
          <Image style={{borderRadius: 10, width: 200, height:200}} source={{uri: `https://firebasestorage.googleapis.com/v0/b/cp3700-f238e.appspot.com/o/${this.makeURL(this.state.imageEmail, "images")}?alt=media&token=0b6c6b86-159f-48ec-b475-806e3a9cf769`}}/>
          <Text>{this.users.find(u => u.id === this.state.imageEmail).caption}</Text>
        </View>
        }
  
        <View style={{marginLeft: "2%"}}>
        
            <View style={{marginBottom: "3%"}}>
            {this.state.records.map(record =>
            <View key={record.id} > 
              <Text>            
              <Image style={{borderRadius: 10}} source={{uri:`https://firebasestorage.googleapis.com/v0/b/cp3700-f238e.appspot.com/o/${this.makeURL(this.users.find(u => u.id === record.username).avatar, "Avatars")}?alt=media&token=0b6c6b86-159f-48ec-b475-806e3a9cf769`}} style={{width:25, height:25}}/>{this.users.find(u => u.id === record.username).name}: {record.message}</Text>
              </View>
              )}
            </View>
          
        </View>
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1, width:"75%", marginLeft:"auto", marginRight:"auto", maxHeight:50}}
        onChangeText={(message) => this.setState({message})}
        value={this.state.message}
        placeholder="Message"

      />
        <Button
          onPress={this.create}
          title="Submit"
          accessibilityLabel="submit"
        />
      </ScrollView>}
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
