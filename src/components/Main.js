import React, { Component } from 'react';

class Main extends Component {

  render() {
    return (
      <div id="content">
        <h1>Paket Ekle</h1>
        <form onSubmit={(event) => {
          event.preventDefault()
          const name = this.packageName.value
          const price = window.web3.utils.toWei(this.packagePrice.value.toString(), 'Ether')
          this.props.createPackage(name, price)
        }}>
          <div className="form-group mr-sm-2">
            <input
              id="packageName"
              type="text"
              ref={(input) => { this.packageName = input }}
              className="form-control"
              placeholder="Product Name"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="packagePrice"
              type="text"
              ref={(input) => { this.packagePrice = input }}
              className="form-control"
              placeholder="Product Price"
              required />
          </div>
          <button type="submit" className="btn btn-primary">Ekle</button>
        </form>
        <p>&nbsp;</p>
        <h2>Paket Al</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">İsim</th>
              <th scope="col">Fiyat</th>
              <th scope="col">Sahibi</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody id="productpackages">
            <h1>{this.props.packages}</h1>
            { this.props.packages.map((packages, key) => {
              return(
                <tr key={key}>
                  <th scope="row">{packages.id.toString()}</th>
                  <td>{packages.name}</td>
                  <td>{window.web3.utils.fromWei(packages.price.toString(), 'Ether')} Eth</td>
                  <td>{packages.owner}</td>
                  <td>
                    { !packages.purchased
                      ? <button
                          name={packages.id}
                          value={packages.price}
                          onClick={(event) => {
                            this.props.purchasePackage(event.target.name, event.target.value)
                          }}
                        >
                          Al
                        </button>
                      : null
                    }
                    </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Main;