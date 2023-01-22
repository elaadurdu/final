import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import OnlineShopping from '../abis/OnlineShopping.json'
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = OnlineShopping.networks[networkId]
    if(networkData) {
      const onlineshopping = web3.eth.Contract(OnlineShopping.abi, networkData.address)
      this.setState({ onlineshopping })
      const packageCount = await onlineshopping.methods.packageCount().call()
      this.setState({ packageCount })
      // Load packages 
      for (var i = 1; i <= packageCount; i++) {
        const packages = await onlineshopping.methods.packages(i).call()
        this.setState({
          packages: [...this.state.packages, packages]
        })
      }
      this.setState({ loading: false})
      console.log(this.state.packages)
    } else {
      window.alert('OnlineShopping contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      packageCount: 0,
      packages: [],
      loading: true
    }

    this.createPackage = this.createPackage.bind(this)
    this.purchasePackage = this.purchasePackage.bind(this)
  }

  createPackage(name, price) {
    this.setState({ loading: true })
    this.state.onlineshopping.methods.createPackage(name, price).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  purchasePackage(id, price) {
    this.setState({ loading: true })
   
    this.state.onlineshopping.methods.purchasePackage(id).send({ from: this.state.account, value: price })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
    
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <Main
                  packages={this.state.packages}
                  createPackage={this.createPackage}
                  purchasePackage={this.purchasePackage} />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;