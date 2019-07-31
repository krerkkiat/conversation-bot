import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import moment from 'moment';
import momentTH from 'moment/locale/th';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import './App.css';

class Home extends Component {
  constructor(props) {
    super(props);

    this.CLIENT_TOKEN = 'RBPNY3P66LRNTEFTZ23WR7MO4IQAWEXQ';
    
    this.GREETINGS_SET = [
      'สวัสดีครับ', 'สวัสดีจ้า', 'เป็นอย่างไรบ้าง?'
    ];
    this.GENERAL_WELLBEING_SET = [
      'สบายดีครับ', 'ไม่สบาย'
    ];

    this.state = {
      inputText: '',
      entries: []
    };

    this.conversationState = {};

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
            let intent_type = res['entities']['intent'][idx].value;

            if (intent_type === 'day_get') {
              var localmoment = moment();
              localmoment.locale('th', momentTH);
              return localmoment.format('dddd');
            } else if (intent_type === 'date_get') {
              var localmoment = moment();
              localmoment.locale('th', momentTH);
              return localmoment.format('LL');
            } else if (intent_type === 'time_get') {
              var localmoment = moment();
              localmoment.locale('th', momentTH);
              return localmoment.format('LT');
            } else if (intent_type === 'general_wellbeing_get') {
              let index = Math.floor(Math.random() * this.GENERAL_WELLBEING_SET.length);
              var response = this.GENERAL_WELLBEING_SET[index];
              
              if (!('general_wellbeing' in this.conversationState)) {
                response = response + ' คุณละครับ? สบายดีไหม?';
              }

              return response;
            } else if (intent_type === 'general_wellbeing_set') {
              if ('general_wellbeing' in res['entities']) {
                if (res['entities']['general_wellbeing'].length >= 1) {
                  this.conversationState['general_wellbeing'] = res['entities']['general_wellbeing'][0]['value'];
                }
              }
              
              return '';
            } else if (intent_type === 'name_get') {
              var response = 'ผมชื่อบอทครับ';
              
              if (!('name' in this.conversationState)) {
                response = response + ' คุณละครับ? คุณชื่ออะไรครับ?';
              }
              
              return response;
            } else if (intent_type === 'name_set') {
              if ('name' in res['entities']) {
                if (res['entities']['name'].length >= 1) {
                  this.conversationState['name'] = res['entities']['name'][0]['value'];
                }
              }

              return '';
            }
          }
        } else if ('greetings' in res['entities']) {
          let index = Math.floor(Math.random() * this.GREETINGS_SET.length);
          return this.GREETINGS_SET[index];
        }

        return 'ผมไม่เข้าใจครับ';
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
        <Col s={12}><h3>Thai Conversation</h3> <Link to="/about">About</Link></Col>
      </Row>
      {this.state.entries.length === 0 && <Row className="justify-content-md-center"><Col lg={3}><p>No chat entry. Start chatting!</p></Col></Row>}
      {this.state.entries.length !== 0 && <Row>
        <Col s={12}>
          <ul className="text-entries">
            {textEntries}
          </ul>
        </Col>
      </Row>}
      <Row className="input-pane container">
        <Col s={12}>
          <Form onSubmit={this.submitHandler}>
            <Form.Group controlId="conversationForm.Text">
              <Form.Control size="lg" type="text" placeholder="ข้อความ" value={this.state.inputText} onChange={this.onTextChangeHandler} autocomplete="off"/>
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </>);
  }
}

class About extends Component {
  render() {
    return (<>
      <Row>
        <Col s={12}><h3>Thai Conversation</h3> <Link to="/">Home</Link></Col>
      </Row>
      <Row>
        <Col s={12}>
          <p>This project is made possible by <a href="https://wit.ai/" target="_blank" rel="noopener noreferrer">wit.ai</a>, <a href="https://facebook.github.io/create-react-app/" target="_blank" rel="noopener noreferrer">create-react-app</a></p>
        </Col>
      </Row>
      <Row>
        <Col s={12}>
          <p>This is heavily inspired by <a href="https://www.youtube.com/watch?v=4SJXvbsACwo&feature=youtu.be" target="_blank" rel="noopener noreferrer">a talk</a> by <a href="https://twitter.com/michaeldelfino" target="_blank" rel="noopener noreferrer">Michael Delfino</a></p>
        </Col>
      </Row>
    </>);
  }
}

class App extends Component {
  render() {
    return (
      <Router>
        <Container>
          <Route exact path="/" component={Home} />
          <Route path="/about" component={About} />
        </Container>
      </Router>
    );
  }
}

export default App;