import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import moment from 'moment';
import momentTH from 'moment/locale/th';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './App.css';

class Home extends Component {
  constructor(props) {
    super(props);

    this.CLIENT_TOKEN = 'RBPNY3P66LRNTEFTZ23WR7MO4IQAWEXQ';
    
    this.GREETINGS = [
      'สวัสดีครับ', 'สวัสดี', 'เป็นอย่างไรบ้าง?'
    ];

    this.state = {
      inputText: '',
      entries: []
    };

    this.submitHandler = this.submitHandler.bind(this);
    this.onTextChangeHandler = this.onTextChangeHandler.bind(this);
  }

  getResponse(text) {
    const q = encodeURIComponent(text);
    const uri = 'https://api.wit.ai/message?q=' + q;
    const auth = 'Bearer ' + this.CLIENT_TOKEN;
    return fetch(uri, {headers: {Authorization: auth}})
     .then(res => res.json())
     .then(res => {
        console.log(res);

        if ('intent' in res['entities']) {
          // Handle intent.
          for (var idx = 0; idx < res['entities']['intent'].length; idx++) {
            if (res['entities']['intent'][idx].value == 'time_get') {
              var localmoment = moment();
              localmoment.locale('th', momentTH);
              return localmoment.format('LLLL');
            } else if (res['entities']['intent'][idx].value == 'general_wellbeing_get') {
              return 'สบายดีครับ คุณละครับ?';
            }
          }
        }

        if ('greetings' in res['entities']) {
          let index = Math.floor(Math.random() * this.GREETINGS.length);
          return this.GREETINGS[index];
        } else if ('general_wellbeing_get' in res['entities']) {
          return 'สบายดีครับ';
        } else {
          return 'ผมไม่เข้าใจครับ';
        }
     });
  }

  submitHandler(e) {
    e.preventDefault();
    
    // Add user text onto the entries.
    var new_entries = this.state.entries;

    new_entries.push({
      text: this.state.inputText,
      from: 'user'
    });

    this.setState({
      entries: new_entries,
      inputText: ''
    });

    // Add response from the bot.
    this.getResponse(this.state.inputText)
      .then(text => {
        if (text !== '') {
          var new_entries = this.state.entries;

          new_entries.push({
            text: text,
            from: 'bot'
          });
      
          this.setState({
            entries: new_entries
          });
        }
      });
  }

  onTextChangeHandler(e) {
    this.setState({
      inputText: e.target.value
    });
  }

  render() {
    let textEntries = this.state.entries.map((ele, idx) => {
      return (<li key={idx} className={ele.from}>
        {ele.from === 'bot' && <span className="name-tag">บอท</span>}
        {ele.from === 'user' && <span className="name-tag">ฉัน</span>}
        <span>{ele.text}</span>
      </li>);
    });

    return (<>
      <Row>
        <Col s={12}><h3>Thai Conversation</h3></Col>
      </Row>
      <Row>
        <Col s={12}>
          <ul className="text-entries">
            {textEntries}
          </ul>
        </Col>
      </Row>
      <div className="input-pane container">
        <Row>
          <Col s={12}>
            <Form onSubmit={this.submitHandler}>
              <Form.Group controlId="conversationForm.Text">
                <Form.Control size="lg" type="text" placeholder="ข้อความ" value={this.state.inputText} onChange={this.onTextChangeHandler} autocomplete="off"/>
              </Form.Group>
            </Form>
          </Col>
        </Row>
      </div>
    </>);
  }
}

class App extends Component {
  render() {
    return (
      <Router>
        <Container>
          <Route exact path="/" component={Home} />
        </Container>
      </Router>
    );
  }
}

export default App;