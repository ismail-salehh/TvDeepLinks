import { useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { openTarget } from './openTarget';

export const TARGETS = [
  { name: 'TvPhotoGallery', url: 'tvphotogallery://' },
  { name: 'TvQuiz', url: 'tvquiz://' },
  { name: 'TvArticles', url: 'tvarticles://' },
];

function App() {
  const [status, setStatus] = useState('');

  const open = (name: string, url: string) => {
    setStatus(`Opening ${name}…`);
    openTarget(name, url).catch(() => setStatus(`${name} is not installed`));
  };

  return (
    <View style={styles.screen}>
      <StatusBar hidden />
      <Text style={styles.title}>Open an app</Text>
      <View style={styles.row}>
        {TARGETS.map(({ name, url }, index) => (
          <Pressable
            key={name}
            testID={name}
            hasTVPreferredFocus={index === 0}
            onPress={() => open(name, url)}
            style={({ focused }) => [styles.button, focused && styles.focused]}
          >
            {({ focused }) => (
              <Text style={[styles.label, focused && styles.focusedLabel]}>
                {name}
              </Text>
            )}
          </Pressable>
        ))}
      </View>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  title: { color: '#fff', fontSize: 40, fontWeight: '600', marginBottom: 48 },
  row: { flexDirection: 'row', gap: 32 },
  button: {
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    borderWidth: 4,
    borderColor: 'transparent',
  },
  focused: {
    backgroundColor: '#fff',
    borderColor: '#4da3ff',
    transform: [{ scale: 1.08 }],
  },
  label: { color: '#fff', fontSize: 28 },
  focusedLabel: { color: '#111' },
  status: { color: '#aaa', fontSize: 24, marginTop: 48, minHeight: 32 },
});

export default App;
