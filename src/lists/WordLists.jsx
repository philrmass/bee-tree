const number = (n) => n.toLocaleString('en-US');

// Each list with its word count, plus +added −removed from the last Add.
export function WordLists({ lists, changes }) {
  return (
    <section class="section">
      <h2>Word lists</h2>
      {!lists ? (
        <p class="muted">Loading…</p>
      ) : (
        <table class="list-table">
          <tbody>
            {lists.map(({ name, count }) => {
              const change = changes[name];
              return (
                <tr key={name}>
                  <td>{name}</td>
                  <td class="num">{number(count)}</td>
                  <td class="num change">
                    {change && (
                      <>
                        <span class="plus">+{number(change.added)}</span>
                        {name !== 'nyt' && <span class="minus"> −{number(change.removed)}</span>}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
