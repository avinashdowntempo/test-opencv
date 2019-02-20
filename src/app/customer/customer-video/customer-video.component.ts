import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { switchMap } from 'rxjs/operators';

import { OpenVidu, Session, StreamEvent, Subscriber, StreamManager, Publisher } from 'openvidu-browser';
import { OpenviduService } from '../../openvidu.service';

@Component({
  selector: 'app-customer-video',
  templateUrl: './customer-video.component.html',
  styleUrls: ['./customer-video.component.css']
})
export class CustomerVideoComponent implements OnInit, OnDestroy {

  @ViewChild('localvideo') localvid: ElementRef;
  OPENVIDU_SERVER_URL = 'https://192.168.51.25:4443';
  OPENVIDU_SERVER_SECRET = 'MY_SECRET';
  // OpenVidu objects
  OV: OpenVidu;
  session: Session;
  // Session properties
  mySessionId: string;
  myUserName: string;

  publisher: StreamManager; // Local
  subscribers: StreamManager[] = [];
  mainStreamManager: StreamManager;


  constructor(private openviduService: OpenviduService, private route: ActivatedRoute,
    private router: Router, ) { }

  @HostListener('window:beforeunload')
  beforeunloadHandler() {
    // On window closed leave session
    this.leaveSession();
  }

  ngOnDestroy() {
    // On component destroyed leave session
    this.leaveSession();
  }
  leaveSession() {

    // --- 7) Leave the session by calling 'disconnect' method over the Session object ---

    if (this.session) { this.session.disconnect(); };

    // Empty all properties...
    this.subscribers = [];
    delete this.publisher;
    delete this.session;
    delete this.OV;
    this.generateParticipantInfo();
  }
  private generateParticipantInfo() {
    //this.mySessionId = Math.random().toString(36).substring(2);
    this.myUserName = 'Participant' + Math.floor(Math.random() * 100);
  }

  initializeSession() {
    // - 1
    this.OV = new OpenVidu();
    // - 2
    this.session = this.OV.initSession();
    // - 3
    this.session.on('streamCreated', (event: StreamEvent) => {
      // Subscribe to the Stream to receive it. Second parameter is undefined
      // so OpenVidu doesn't create an HTML video by its own
      let subscriber: Subscriber = this.session.subscribe(event.stream, undefined);
      this.subscribers.push(subscriber);
    });

    // On every Stream destroyed...
    this.session.on('streamDestroyed', (event: StreamEvent) => {
      // Remove the stream from 'subscribers' array
      //this.deleteSubscriber(event.stream.streamManager);
      this.deleteSubscriber(event.stream.streamManager);
    });

    // - 4
    this.getToken().then(token => {
      // let newtok = token.replace('wss://localhost:4443', 'wss://192.168.51.25:4443');
      // First param is the token got from OpenVidu Server. Second param can be retrieved by every user on event
      // 'streamCreated' (property Stream.connection.data), and will be appended to DOM as the user's nickname

      this.session.connect(token, { clientData: this.myUserName })
        .then(() => {
          // - 5) Get your own camera stream ---
          // Init a publisher passing undefined as targetElement (we don't want OpenVidu to insert a video
          // element: we will manage it on our own) and with the desired properties

          let publisher: Publisher = this.OV.initPublisher(undefined, {
            audioSource: undefined, // The source of audio. If undefined default microphone
            videoSource: undefined, // The source of video. If undefined default webcam
            publishAudio: true,     // Whether you want to start publishing with your audio unmuted or not
            publishVideo: true,     // Whether you want to start publishing with your video enabled or not
            resolution: '640x480',  // The resolution of your video
            frameRate: 30,          // The frame rate of your video
            insertMode: 'APPEND',   // How the video is inserted in the target element 'video-container'
            mirror: false           // Whether to mirror your local video or not
          });

          // --- 6) Publish your stream ---
          this.session.publish(publisher);

          // Set the main video in the page to display our webcam and store our Publisher
          this.mainStreamManager = publisher;
          this.publisher = publisher;
          this.publisher.addVideoElement(this.localvid.nativeElement);
        })
        .catch(error => {
          console.log('There was an error connecting to the session:', error.code, error.message);
        });
    });
  }

  private deleteSubscriber(streamManager: StreamManager): void {
    let index = this.subscribers.indexOf(streamManager, 0);
    if (index > -1) {
      this.subscribers.splice(index, 1);
    }
  }

  getToken(): Promise<string> {
    return this.openviduService.createSession(this.mySessionId, this.OPENVIDU_SERVER_SECRET, this.OPENVIDU_SERVER_URL).then(
      sessionId => {
        console.warn(sessionId);
        return this.openviduService.createToken(sessionId, this.OPENVIDU_SERVER_SECRET, this.OPENVIDU_SERVER_URL);
      })
  }

  ngOnInit() {
    this.mySessionId = this.route.snapshot.paramMap.get('id')
    alert(this.mySessionId);
    this.generateParticipantInfo();
    this.initializeSession();
  }
}
