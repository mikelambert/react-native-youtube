/**
 * @providesModule YouTube
 * @flow
 */

'use strict';

import React, { Component, PropTypes } from 'react';
import {
  DeviceEventEmitter,
  View,
  StyleSheet,
  requireNativeComponent,
  NativeModules,
  NativeMethodsMixin
} from 'react-native';

const RCTYouTube = requireNativeComponent('ReactYouTube', YouTube,
{
  nativeOnly: {
    onError: true,
    onReady: true,
    onChangeState: true,
    onChangeQuality: true,
    onProgress: true,
  },
});

export default class YouTube extends Component {
  static propTypes = {
    style: View.propTypes.style,
    videoId: PropTypes.string.isRequired,
    apiKey: PropTypes.string.isRequired,
    playsInline: PropTypes.bool,
    showinfo: PropTypes.bool,
    modestbranding: PropTypes.bool,
    controls: PropTypes.oneOf([0,1,2]),
    origin: PropTypes.string,
    play: PropTypes.bool,
    rel: PropTypes.bool,
    hidden: PropTypes.bool,
    onReady: PropTypes.func,
    onChangeState: PropTypes.func,
    onChangeQuality: PropTypes.func,
    onError: PropTypes.func,
    onProgress: PropTypes.func, // TODO: Make this work on android
    loop: PropTypes.bool,
  };

  static defaultProps = {
    loop: false,
  };

  _root: any;

  constructor(props) {
    super(props);
    this._exportedProps = NativeModules.YouTubeManager && NativeModules.YouTubeManager.exportedProps;

    this._onReady = this._onReady.bind(this);
    this._onChangeState = this._onChangeState.bind(this);
    this._onChangeQuality = this._onChangeQuality.bind(this);
    this._onError = this._onError.bind(this);
    this._onProgress = this._onProgress.bind(this);
  }

  setNativeProps(nativeProps: any) {
    this._root.setNativeProps(nativeProps);
  }

  _onReady(event) {
    return this.props.onReady && this.props.onReady(event.nativeEvent);
  }

  _onChangeState(event) {
    if(event.nativeEvent.state == 'ended' && this.props.loop) {
      this.seekTo(0);
    }
    return this.props.onChangeState && this.props.onChangeState(event.nativeEvent);
  }

  _onChangeQuality(event) {
    return this.props.onChangeQuality && this.props.onChangeQuality(event.nativeEvent);
  }

  _onError(event) {
    return this.props.onError && this.props.onError(event.nativeEvent);
  }
  _onProgress(event){
    return this.props.onProgress && this.props.onProgress(event.nativeEvent);
  }
  seekTo(seconds){
    this.refs.youtubePlayer.seekTo(parseInt(seconds, 10));
  }

  render() {
    var style = [styles.base, this.props.style];
    var nativeProps = Object.assign({}, this.props);
    nativeProps.style = style;

    /*
     * Try to use `playerParams` instead of settings `playsInline` and
     * `videoId` individually.
     */
    if (this._exportedProps) {
      if (this._exportedProps.playerParams) {
        nativeProps.playerParams = {
          videoId: this.props.videoId,
        };
        delete nativeProps.videoId;

        nativeProps.playerParams.playerVars = {};

        if (this.props.playsInline) {
          nativeProps.playerParams.playerVars.playsinline = 1;
          delete nativeProps.playsInline;
        };
        if (this.props.modestbranding) {
          nativeProps.playerParams.playerVars.modestbranding = 1;
          delete nativeProps.modestbranding;
        };

        if (this.props.showinfo!==undefined) {
          nativeProps.playerParams.playerVars.showinfo = this.props.showinfo ? 1 : 0;
          delete nativeProps.showinfo;
        };
        if (this.props.controls!==undefined) {
          nativeProps.playerParams.playerVars.controls = this.props.controls;
          delete nativeProps.controls;
        };
        if (this.props.origin!==undefined) {
          nativeProps.playerParams.playerVars.origin = this.props.origin;
          delete nativeProps.origin;
        };
        if (this.props.rel!==undefined) {
          nativeProps.playerParams.playerVars.rel = this.props.rel ? 1 : 0;
          delete nativeProps.rel;
        };
      };
    } else {
      /*
       * For compatibility issues with an older version where setting both
       * `playsInline` and `videoId` in quick succession would cause the video
       * to sometimes not play.
       */
      delete nativeProps.playsInline;
    }

    return <RCTYouTube
      ref={component => { this._root = component; }}
      onReady={this._onReady}
      {...nativeProps}
      // These override and delegate to the this.props functions
      onChangeState={this._onChangeState}
      onChangeQuality={this._onChangeQuality}
      onError={this._onError}
      onProgress={this._onProgress}
      />;
  }
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
