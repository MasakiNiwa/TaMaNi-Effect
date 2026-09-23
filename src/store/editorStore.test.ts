import { beforeEach, describe, expect, it } from 'vitest';
import { useEditor } from './editorStore';
import { useNav } from './navStore';

const ids = () => useEditor.getState().layers.map((l) => l.effectId);

beforeEach(() => {
  useEditor.setState({ layers: [], past: [], future: [], selectedUid: null });
  useNav.setState({ nav: { level: 'groups' } });
});

describe('editorStore', () => {
  it('reorderLayers で並べ替えられ、元に戻せる', () => {
    const { addLayer } = useEditor.getState();
    addLayer('dots');
    addLayer('glitch');
    const [a, b] = useEditor.getState().layers.map((l) => l.uid);
    useEditor.getState().reorderLayers([b, a]);
    expect(ids()).toEqual(['glitch', 'dots']);
    useEditor.getState().undo();
    expect(ids()).toEqual(['dots', 'glitch']);
  });

  it('reorderLayers は不完全な一覧を無視する', () => {
    useEditor.getState().addLayer('dots');
    useEditor.getState().addLayer('glitch');
    useEditor.getState().reorderLayers(['unknown']);
    expect(ids()).toEqual(['dots', 'glitch']);
  });
});

describe('navStore', () => {
  it('新しく追加したエフェクトはキャンセルで取り消される', () => {
    useNav.getState().pickEffect('dots');
    expect(useNav.getState().nav.level).toBe('edit');
    const uid = useEditor.getState().layers[0].uid;
    useEditor.getState().checkpoint();
    useEditor.getState().setParam(uid, 'spacing', 30);
    useNav.getState().cancel();
    expect(ids()).toEqual([]);
    expect(useNav.getState().nav).toEqual({ level: 'effects', category: 'pattern' });
  });

  it('既存のエフェクトを選ぶと追加せずに編集し、キャンセルで変更だけ戻す', () => {
    useNav.getState().pickEffect('dots');
    useNav.getState().done();
    useNav.getState().pickEffect('dots');
    expect(ids()).toEqual(['dots']);
    const uid = useEditor.getState().layers[0].uid;
    useEditor.getState().checkpoint();
    useEditor.getState().setParam(uid, 'spacing', 30);
    useNav.getState().cancel();
    expect(ids()).toEqual(['dots']);
    expect(useEditor.getState().layers[0].params.spacing).toBe(14);
  });
});
