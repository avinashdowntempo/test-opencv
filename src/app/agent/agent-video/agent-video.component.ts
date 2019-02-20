import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { OpenVidu, Session, StreamEvent, Subscriber, StreamManager, Publisher } from 'openvidu-browser';
import { OpenviduService } from '../../openvidu.service';

@Component({
  selector: 'app-agent-video',
  templateUrl: './agent-video.component.html',
  styleUrls: ['./agent-video.component.css']
})
export class AgentVideoComponent implements OnInit {

  @ViewChild('localvideo') localvid: ElementRef;
  @ViewChild('customervideo') cutomervid: ElementRef;
  @ViewChild('imgelement') imgsrc: ElementRef;
  @ViewChild('canvasOutput') canvassrc: ElementRef;

  OPENVIDU_SERVER_URL = 'https://192.168.51.25:4443';
  OPENVIDU_SERVER_SECRET = 'MY_SECRET';
  // OpenVidu objects
  OV: OpenVidu;
  session: Session;
  // Session properties
  mySessionId: string;
  myUserName: string;

  totframes = 0;
  lights = 0;

  publisher: StreamManager; // Local
  subscribers: StreamManager[] = [];
  mainStreamManager: StreamManager;

  constructor(private openviduService: OpenviduService, private ref: ChangeDetectorRef) {
    this.generateParticipantInfo();
    this.initializeSession();
    setInterval(() => {
      // require view to be updated
      //console.log("look for changes");
      this.ref.markForCheck();
    }, 1000);

  }

  testopencv() {
    let srcelem = this.imgsrc.nativeElement;
    let newimg = new Image();
    newimg.src = srcelem.src;
    console.warn("loading");
    let cap = new cv.VideoCapture(this.localvid.nativeElement);
    const FPS = 30;
    let processVideo = () => {
      this.totframes++;
      let src = new cv.Mat(500, 500, cv.CV_8UC4);
      let dst = new cv.Mat(240, 320, cv.CV_8UC1);
      let begin = Date.now();
      cap.read(src);
      cv.cvtColor(src, dst, cv.COLOR_BGR2HSV);
      let low = new cv.Mat(dst.rows, dst.cols, dst.type(), [69, 100, 100, 255]);
      let high = new cv.Mat(dst.rows, dst.cols, dst.type(), [79, 225, 255, 255]);
      let ksize = new cv.Size(10, 10);
      let anchor = new cv.Point(-1, -1);
      cv.blur(dst, dst, ksize, anchor, cv.BORDER_DEFAULT);
      cv.inRange(dst, low, high, dst);
      let N = cv.Mat.ones(10, 5, cv.CV_8U);
      let O = cv.Mat.ones(5, 5, cv.CV_8U);
      cv.morphologyEx(dst, dst, cv.MORPH_CLOSE, O);
      cv.dilate(dst, dst, N, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
      var x_coord = [];
      let size_contour = contours.size();
      this.lights = contours.size();
      for (let i = 0; i < contours.size(); ++i) {
        let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
          Math.round(Math.random() * 255));
        let cnt = contours.get(i);
        let Moments = cv.moments(cnt, false);
        let cx = Moments.m10 / Moments.m00;
        let cy = Moments.m01 / Moments.m00;
        let center = new cv.Point(cx, cy);
        cv.circle(dst, center, 4, [0, 0, 0, 255], 3);
        cv.drawContours(dst, contours, i, color, 2, cv.LINE_8, hierarchy, 0);
      }
      if (contours.size() == 2) {
        console.log("power is on");
      }
      if (contours.size() == 5) {
        console.log("everything is working");
      }
      if (contours.size() == 0) {
        console.log("power is off");
      }
      cv.imshow('canvasOutput', dst);
      src.delete();
      dst.delete();
      high.delete();
      low.delete();
      N.delete();
      O.delete();
      contours.delete();
      hierarchy.delete();
      let delay = 1000 / FPS - (Date.now() - begin);
      if (this.totframes < 1000) {
        setTimeout(processVideo, delay);
      } else {
        this.totframes = 0;
      }
    }
    // schedule first one.
    setTimeout(processVideo, 0);
  }
  private generateParticipantInfo() {
    this.mySessionId = Math.random().toString(36).substring(2);
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
      alert('new stream created');
      let subscriber: Subscriber = this.session.subscribe(event.stream, undefined);
      this.subscribers.push(subscriber);
      subscriber.addVideoElement(this.cutomervid.nativeElement);
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
          this.testopencv();
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
  }

}
