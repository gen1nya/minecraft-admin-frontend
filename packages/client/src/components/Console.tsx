import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { theme, Card, CardHeader, CardTitle, Button, Input } from '@/styles';
import { useServer } from '@/context';

const ConsoleBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const OutputArea = styled.div`
  background: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize.sm};
`;

const OutputLine = styled.div<{ $type: 'command' | 'response' | 'error' }>`
  color: ${props => {
    switch (props.$type) {
      case 'command': return theme.colors.primary.light;
      case 'error': return theme.colors.status.error;
      default: return theme.colors.text.secondary;
    }
  }};
  margin-bottom: ${theme.spacing.xs};
  white-space: pre-wrap;
  word-break: break-word;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CommandPrefix = styled.span`
  color: ${theme.colors.text.disabled};
  user-select: none;
`;

const InputRow = styled.form`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const CommandInput = styled(Input)`
  flex: 1;
  font-family: ${theme.typography.fontFamily.mono};
`;

const EmptyState = styled.div`
  color: ${theme.colors.text.disabled};
  text-align: center;
  padding: ${theme.spacing.lg};
`;

// Minecraft color codes
const MC_COLORS: Record<string, string> = {
  '0': '#000000', // black
  '1': '#0000AA', // dark_blue
  '2': '#00AA00', // dark_green
  '3': '#00AAAA', // dark_aqua
  '4': '#AA0000', // dark_red
  '5': '#AA00AA', // dark_purple
  '6': '#FFAA00', // gold
  '7': '#AAAAAA', // gray
  '8': '#555555', // dark_gray
  '9': '#5555FF', // blue
  'a': '#55FF55', // green
  'b': '#55FFFF', // aqua
  'c': '#FF5555', // red
  'd': '#FF55FF', // light_purple
  'e': '#FFFF55', // yellow
  'f': '#FFFFFF', // white
};

interface TextSegment {
  text: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
}

function parseMinecraftText(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /§([0-9a-fk-or])/gi;

  let lastIndex = 0;
  let currentColor: string | undefined;
  let bold = false;
  let italic = false;
  let underline = false;
  let strikethrough = false;

  let match;
  while ((match = regex.exec(text)) !== null) {
    // Add text before this code
    if (match.index > lastIndex) {
      const segment = text.slice(lastIndex, match.index);
      if (segment) {
        segments.push({ text: segment, color: currentColor, bold, italic, underline, strikethrough });
      }
    }

    const code = match[1].toLowerCase();

    if (MC_COLORS[code]) {
      currentColor = MC_COLORS[code];
    } else if (code === 'l') {
      bold = true;
    } else if (code === 'o') {
      italic = true;
    } else if (code === 'n') {
      underline = true;
    } else if (code === 'm') {
      strikethrough = true;
    } else if (code === 'r') {
      currentColor = undefined;
      bold = false;
      italic = false;
      underline = false;
      strikethrough = false;
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), color: currentColor, bold, italic, underline, strikethrough });
  }

  return segments;
}

function MinecraftText({ text }: { text: string }) {
  const segments = parseMinecraftText(text);

  return (
    <>
      {segments.map((segment, i) => (
        <span
          key={i}
          style={{
            color: segment.color,
            fontWeight: segment.bold ? 'bold' : undefined,
            fontStyle: segment.italic ? 'italic' : undefined,
            textDecoration: [
              segment.underline && 'underline',
              segment.strikethrough && 'line-through',
            ].filter(Boolean).join(' ') || undefined,
          }}
        >
          {segment.text}
        </span>
      ))}
    </>
  );
}

interface OutputEntry {
  id: number;
  type: 'command' | 'response' | 'error';
  text: string;
}

export function Console() {
  const { api } = useServer();
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<OutputEntry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = (type: OutputEntry['type'], text: string) => {
    setOutput(prev => [...prev, { id: idRef.current++, type, text }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.trim();
    if (!cmd || !api) return;

    addOutput('command', `> ${cmd}`);
    setHistory(prev => [...prev.filter(h => h !== cmd), cmd]);
    setHistoryIndex(-1);
    setCommand('');
    setLoading(true);

    try {
      const result = await api.sendCommand(cmd);
      if (result.response) {
        addOutput('response', result.response);
      } else {
        addOutput('response', '(no output)');
      }
    } catch (err) {
      addOutput('error', `Error: ${err instanceof Error ? err.message : 'Command failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Console</CardTitle>
      </CardHeader>
      <ConsoleBody>
        <OutputArea ref={outputRef}>
          {output.length === 0 ? (
            <EmptyState>Enter a command below to get started</EmptyState>
          ) : (
            output.map(entry => (
              <OutputLine key={entry.id} $type={entry.type}>
                {entry.type === 'command' && <CommandPrefix></CommandPrefix>}
                {entry.type === 'response' ? <MinecraftText text={entry.text} /> : entry.text}
              </OutputLine>
            ))
          )}
        </OutputArea>
        <InputRow onSubmit={handleSubmit}>
          <CommandInput
            type="text"
            placeholder="Enter RCON command..."
            value={command}
            onChange={e => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
          />
          <Button type="submit" disabled={loading || !command.trim() || !api}>
            {loading ? '...' : 'Send'}
          </Button>
        </InputRow>
      </ConsoleBody>
    </Card>
  );
}
