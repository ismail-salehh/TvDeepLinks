import ReactTestRenderer from 'react-test-renderer';
import { Linking, Text } from 'react-native';
import App, { TARGETS } from '../App';

const render = async () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<App />);
  });
  return tree;
};

const press = (tree: ReactTestRenderer.ReactTestRenderer, id: string) =>
  ReactTestRenderer.act(async () => {
    tree.root.findByProps({ testID: id }).props.onPress();
  });

const statusText = (tree: ReactTestRenderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).pop()!.props.children;

afterEach(() => jest.restoreAllMocks());

test('one button per app, in this order', () => {
  expect(TARGETS.map(t => t.name)).toEqual([
    'TvPhotoGallery',
    'TvQuiz',
    'TvArticles',
  ]);
});

test.each([
  ['TvPhotoGallery', 'tvphotogallery://'],
  ['TvQuiz', 'tvquiz://'],
  ['TvArticles', 'tvarticles://'],
])('%s button sends %s', async (name, url) => {
  const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  const tree = await render();
  await press(tree, name);
  expect(openURL).toHaveBeenCalledWith(url);
  expect(statusText(tree)).toBe(`Opening ${name}…`);
});

test('a focused button is highlighted, an unfocused one is not', async () => {
  const tree = await render();
  const button = tree.root.findByProps({ testID: 'TvQuiz' }).props;
  const look = (focused: boolean) => ({
    box: button.style({ focused }).filter(Boolean),
    text: button.children({ focused }).props.style.filter(Boolean),
  });
  expect(look(true).box).toHaveLength(2);
  expect(look(true).text).toHaveLength(2);
  expect(look(false).box).toHaveLength(1);
  expect(look(false).text).toHaveLength(1);
});

test('only the first button asks for focus', async () => {
  const tree = await render();
  const preferred = ['TvPhotoGallery', 'TvQuiz', 'TvArticles'].map(
    id => tree.root.findByProps({ testID: id }).props.hasTVPreferredFocus,
  );
  expect(preferred).toEqual([true, false, false]);
});

test('reports an app that is not installed', async () => {
  jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no handler'));
  const tree = await render();
  await press(tree, 'TvQuiz');
  expect(statusText(tree)).toBe('TvQuiz is not installed');
});
