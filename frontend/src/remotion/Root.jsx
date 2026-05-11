import { Composition } from 'remotion'
import { LaunchVideo } from './LaunchVideo'

export function RemotionRoot() {
  return (
    <Composition
      id="FusionLabLaunch"
      component={LaunchVideo}
      durationInFrames={1080}
      fps={30}
      width={1920}
      height={1080}
    />
  )
}
