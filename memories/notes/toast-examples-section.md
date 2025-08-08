# Toast example section

```tsx
{
   /* Toast Examples Section */
}
;<div className='py-12'>
   <div className='mx-auto max-w-7xl px-6 lg:px-8'>
      <div className='mx-auto max-w-2xl text-center'>
         <h2 className='mb-8 text-2xl font-bold'>Toast Notifications Demo</h2>
         <div className='flex flex-wrap justify-center gap-4'>
            <ActionButton
               icon='check'
               variant='secondary'
               color='emerald'
               onClick={() =>
                  toast.success('Team created successfully!', {
                     description: 'Your team has been added to the tournament.',
                  })
               }
            >
               Success
            </ActionButton>
            <ActionButton
               icon='exclamation_mark'
               variant='secondary'
               color='red'
               onClick={() =>
                  toast.error('Failed to save team', {
                     description: 'Please check your connection and try again.',
                  })
               }
            >
               Error
            </ActionButton>
            <ActionButton
               icon='exclamation_mark'
               variant='secondary'
               color='yellow'
               onClick={() =>
                  toast.warning('Tournament is full', {
                     description: 'Only 2 spots remaining for registration.',
                  })
               }
            >
               Warning
            </ActionButton>
            <ActionButton
               icon='info_letter'
               variant='secondary'
               color='cyan'
               onClick={() =>
                  toast.info('New update available', {
                     description: 'Version 2.1.0 includes performance improvements.',
                  })
               }
            >
               Info
            </ActionButton>
         </div>
      </div>
   </div>
</div>
```
