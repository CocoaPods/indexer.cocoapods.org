import { formatPod } from '../index';
import fakePods from './__fixtures__/pods.js';

it('works with some artificial pods', () => {
  const cleanedPods = fakePods.map(formatPod);
  cleanedPods.forEach(pod => {
    expect(pod).toMatchSnapshot(pod.objectID);
  });
});
