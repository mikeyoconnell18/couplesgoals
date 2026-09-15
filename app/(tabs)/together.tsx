import { StyleSheet, Text } from 'react-native';
import { MomentumRing } from '@/components/momentum-ring';
import { Placeholder, Screen } from '@/components/screen';
import { useDemo } from '@/features/demo/demo-context';
import { colors } from '@/theme/tokens';
export default function Together() {
  const { momentum } = useDemo();
  return (
    <Screen eyebrow="You two" title="Better together">
      <MomentumRing value={momentum} />
      <Text style={styles.heading}>Your week together</Text>
      <Placeholder>
        Three actions are moving. Your first Weekly Showdown will put the shared
        result first.
      </Placeholder>
    </Screen>
  );
}
const styles = StyleSheet.create({
  heading: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 20,
  },
});
